"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./homepage.css";

export default function Homepage() {
    const [hasEntered, setHasEntered] = useState(false);
    const [activeTab, setActiveTab] = useState("my-groceries"); // "my-groceries" | "local-marketplace"

    // Auto-enter after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasEntered(true);
        }, 3000); // 3 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="homepage-root">
            {/* INTRO OVERLAY (transparent green → fade out) */}
            <div
                className={`intro-overlay ${hasEntered ? "intro-overlay--fade-out" : ""
                    }`}
            >
                <div className="intro-content">
                    <h1 className="intro-title hover-grow">SaveMyFoods</h1>

                    <p className="intro-subtitle">
                        <span className="typewriter hover-grow">
                            Your grocery-sharing marketplace.
                        </span>
                    </p>

                    {/* You can keep or delete this hint text; it no longer controls anything */}
                    <p className="intro-hint hover-grow-small">
                        Welcome in!
                    </p>
                </div>
            </div>

            {/* REAL HOMEPAGE */}
            <div className="homepage-shell">
                {/* Header */}
                <header className="homepage-header">
                    <div className="header-left">
                        <Image
                            src="/icon.png"
                            alt="SaveMyFoods logo"
                            width={50}
                            height={50}
                            className="header-logo"
                        />
                        <span className="header-title">SaveMyFoods</span>
                    </div>
                </header>

                {/* Main layout: left column + tabs */}
                <section className="homepage-content">
                    <div className="homepage-layout">
                        {/* LEFT COLUMN – My Selling List */}
                        <aside className="sidebar">
                            <h3 className="sidebar-title">My selling list</h3>
                            <p className="sidebar-helper">
                                Add any food or groceries you want to sell or share.
                            </p>

                            <div className="selling-form">
                                <input
                                    className="selling-input"
                                    type="text"
                                    placeholder="e.g. 2L milk (expires Friday)"
                                />
                                <input
                                    className="selling-input"
                                    type="text"
                                    placeholder="Price or ‘free’"
                                />
                                <button className="selling-button">
                                    Add to list
                                </button>
                            </div>

                            <div className="selling-list">
                                <p className="selling-empty">
                                    Your list is empty for now.
                                </p>
                                {/* Later you can map over items here */}
                            </div>
                        </aside>

                        {/* RIGHT – Tabs + content */}
                        <div className="main-panel">
                            {/* Tabs */}
                            <div className="tabs">
                                <button
                                    className={`tab hover-grow-small ${activeTab === "my-groceries"
                                            ? "tab--active"
                                            : ""
                                        }`}
                                    onClick={() => setActiveTab("my-groceries")}
                                >
                                    My groceries
                                </button>

                                <button
                                    className={`tab hover-grow-small ${activeTab === "local-marketplace"
                                            ? "tab--active"
                                            : ""
                                        }`}
                                    onClick={() => setActiveTab("local-marketplace")}
                                >
                                    Local marketplace
                                </button>
                            </div>

                            {/* Tab content */}
                            <div className="tab-panel">
                                {activeTab === "my-groceries" && (
                                    <div className="tab-section">
                                        <h2 className="tab-heading">
                                            My groceries
                                        </h2>
                                        <p className="tab-text">
                                            Track what you have at home, what’s
                                            expiring soon, and decide what to
                                            share or sell.
                                        </p>
                                        {/* groceries UI here later */}
                                    </div>
                                )}

                                {activeTab === "local-marketplace" && (
                                    <div className="tab-section">
                                        <h2 className="tab-heading">
                                            Local marketplace
                                        </h2>
                                        <p className="tab-text">
                                            Browse groceries your neighbours are
                                            selling or giving away near you.
                                        </p>
                                        {/* marketplace UI here later */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
