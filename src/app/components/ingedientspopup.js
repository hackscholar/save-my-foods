"use client";

import { useEffect, useRef, useState } from "react";

function formatMatchedIngredients(entries = []) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry, index) => {
      const itemId = entry.itemId ?? entry.item_id ?? null;
      if (!itemId) return null;
      return {
        id: itemId,
        itemId,
        itemName: entry.itemName ?? entry.item_name ?? entry.aiName ?? `Ingredient ${index + 1}`,
        aiName: entry.aiName ?? null,
        quantity:
          entry.quantity !== null && entry.quantity !== undefined
            ? String(entry.quantity)
            : "1",
        availableQuantity:
          entry.availableQuantity !== null && entry.availableQuantity !== undefined
            ? Number(entry.availableQuantity)
            : null,
        suggestedQuantity: entry.suggestedQuantity ?? entry.suggested_quantity ?? null,
      };
    })
    .filter(Boolean);
}

export default function Popup({ isOpen, onClose, onConfirm, sellerId }) {
  const fileInputRef = useRef(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "Upload a photo of what you ate to mark ingredients as used.",
  );

  useEffect(() => {
    if (!isOpen) {
      setIngredients([]);
      setError(null);
      setLoading(false);
      setSubmitting(false);
      setStatusMessage("Upload a photo of what you ate to mark ingredients as used.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!sellerId) {
      setError("You must be signed in to analyze meals.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatusMessage("Uploading and analyzing your meal…");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("sellerId", sellerId);

      const uploadResponse = await fetch("/api/uploads/product-image", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error ?? "Failed to upload photo.");
      }

      const analyzeResponse = await fetch("/api/ingredients/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.publicUrl ?? uploadData.path,
          sellerId,
        }),
      });
      const analyzeData = await analyzeResponse.json();
      if (!analyzeResponse.ok) {
        throw new Error(analyzeData?.error ?? "Unable to detect ingredients.");
      }

      const formatted = formatMatchedIngredients(analyzeData.ingredients ?? []);
      setIngredients(formatted);
      if (formatted.length === 0) {
        setStatusMessage("We could not match this dish to your groceries.");
      } else {
        setStatusMessage("Adjust the servings for each ingredient and confirm.");
      }
    } catch (err) {
      setError(err.message ?? "Unable to analyze that image.");
      setIngredients([]);
      setStatusMessage("Try uploading a clearer photo of what you cooked.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleOpenFilePicker() {
    if (loading || submitting) return;
    fileInputRef.current?.click();
  }

  function updateQuantity(index, value) {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: value };
      return copy;
    });
  }

  async function handleConfirm() {
    if (!onConfirm) return;
    const payload = ingredients
      .map((ingredient) => ({
        itemId: ingredient.itemId,
        quantity: Number(ingredient.quantity),
        itemName: ingredient.itemName,
      }))
      .filter(
        (entry) =>
          entry.itemId &&
          entry.quantity !== null &&
          !Number.isNaN(entry.quantity) &&
          entry.quantity > 0,
      );

    if (payload.length === 0) {
      setError("Adjust at least one ingredient quantity before confirming.");
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(payload);
    } catch (err) {
      setError(err.message ?? "Unable to update your groceries right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(event) => event.stopPropagation()}>
        <button className="popup-x" onClick={onClose}>
          ×
        </button>

        <h2>Have you cooked today?</h2>
        <p className="ingredients-message">{statusMessage}</p>
        {error && <p className="helper-text error">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="popup-content">
          {ingredients.length > 0 && (
            <div className="ingredients-list">
              <p className="ingredients-title">Ingredients detected — adjust quantities:</p>

              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="ingredient-row">
                  <div className="ingredient-info">
                    <span className="ingredient-label">{ingredient.itemName}</span>
                    {ingredient.aiName && ingredient.aiName !== ingredient.itemName && (
                      <span className="ingredient-hint">AI: {ingredient.aiName}</span>
                    )}
                    {ingredient.availableQuantity !== null && (
                      <span className="ingredient-available">
                        {ingredient.availableQuantity} in pantry
                      </span>
                    )}
                  </div>

                  <input
                    className="ingredient-input"
                    value={ingredient.quantity}
                    onChange={(event) => updateQuantity(index, event.target.value)}
                    placeholder="Qty"
                    inputMode="decimal"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            className="popup-button upload-button-full"
            onClick={handleOpenFilePicker}
            disabled={loading || submitting}
          >
            {loading ? "Analyzing…" : "Upload a picture"}
          </button>

          {ingredients.length > 0 && (
            <button
              className="popup-button confirm-button-full"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Updating…" : "Confirm ingredients"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
