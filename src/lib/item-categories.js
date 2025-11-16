export const ITEM_CATEGORIES = [
  { value: "produce", label: "Produce" },
  { value: "bakery", label: "Bakery" },
  { value: "meat_seafood", label: "Meat & Seafood" },
  { value: "dairy_eggs", label: "Dairy & Eggs" },
  { value: "pantry", label: "Pantry" },
  { value: "snacks", label: "Snacks" },
  { value: "frozen", label: "Frozen" },
];

export const ITEM_CATEGORY_VALUES = ITEM_CATEGORIES.map((category) => category.value);

const CATEGORY_LABEL_LOOKUP = ITEM_CATEGORIES.reduce((acc, category) => {
  acc[category.value] = category.label;
  return acc;
}, {});

const CATEGORY_SYNONYMS = {
  produce: ["produce", "fruit", "fruits", "vegetable", "vegetables", "veggies"],
  bakery: ["bakery", "bread", "pastry", "pastries", "baked"],
  meat_seafood: ["meat", "seafood", "fish", "beef", "poultry", "chicken"],
  dairy_eggs: ["dairy", "egg", "eggs", "milk", "cheese", "butter", "yogurt"],
  pantry: ["pantry", "grain", "rice", "beans", "lentil", "flour"],
  snacks: ["snack", "snacks", "chips", "crackers", "treat"],
  frozen: ["frozen", "freezer", "ice cream"],
};

export function getCategoryLabel(value) {
  if (!value) {
    return "Uncategorized";
  }
  return CATEGORY_LABEL_LOOKUP[value] ?? "Uncategorized";
}

export function normalizeCategory(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const raw = value.toString().trim().toLowerCase();
  if (!raw) {
    return null;
  }

  if (ITEM_CATEGORY_VALUES.includes(raw)) {
    return raw;
  }

  const slug = raw.replace(/[\s-]+/g, "_");
  if (ITEM_CATEGORY_VALUES.includes(slug)) {
    return slug;
  }

  for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some((token) => raw.includes(token))) {
      return category;
    }
  }

  return null;
}
