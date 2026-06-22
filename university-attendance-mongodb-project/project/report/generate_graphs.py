"""
generate_graphs.py

Generates 3 comparison charts for the MongoDB indexing benchmark project:
  1. Query Time Before vs After Index (bar chart)
  2. Documents Examined Before vs After Index (bar chart, log scale)
  3. Execution Time Per Query (line chart)

Usage:
    pip install matplotlib
    python generate_graphs.py

Output is written to ../screenshots/ as PNG files.
EDIT THE "DATA" SECTION BELOW with your actual benchmark results before
running this script (use the values from mongodb/queries_without_index.js
and mongodb/queries_after_index.js).
"""

import os
import matplotlib.pyplot as plt
import numpy as np

# ============================================================
# DATA — REPLACE THESE PLACEHOLDER VALUES WITH YOUR ACTUAL RESULTS
# ============================================================

QUERY_LABELS = [
    "Q1\nstudent_id",
    "Q2\nemail",
    "Q3\nname",
    "Q4\nattend.\nstudent_id",
    "Q5\nattend.\ncourse_id",
    "Q6\nexact\ndate",
    "Q7\ndate\nrange",
    "Q8\ncount/\nmajor",
    "Q9\nstatus",
    "Q10\ntop 10\ncourses",
]

# executionTimeMillis BEFORE indexing (placeholder values)
TIME_BEFORE = [45, 48, 52, 40, 38, 35, 42, 60, 39, 65]

# executionTimeMillis AFTER indexing (placeholder values)
TIME_AFTER = [1, 1, 3, 1, 2, 1, 2, 25, 37, 30]

# totalDocsExamined BEFORE indexing (placeholder values)
DOCS_BEFORE = [5000, 5000, 5000, 95000, 95000, 95000, 95000, 5000, 95000, 95000]

# totalDocsExamined AFTER indexing (placeholder values)
DOCS_AFTER = [1, 1, 15, 19, 950, 260, 7800, 5000, 95000, 95000]

# ============================================================
# OUTPUT SETUP
# ============================================================

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.rcParams["figure.dpi"] = 120


def chart_query_time_before_after():
    x = np.arange(len(QUERY_LABELS))
    width = 0.35

    fig, ax = plt.subplots(figsize=(12, 6))
    bars1 = ax.bar(x - width / 2, TIME_BEFORE, width, label="Before Index", color="#e74c3c")
    bars2 = ax.bar(x + width / 2, TIME_AFTER, width, label="After Index", color="#27ae60")

    ax.set_xlabel("Query")
    ax.set_ylabel("Execution Time (ms)")
    ax.set_title("Query Time: Before vs After Indexing")
    ax.set_xticks(x)
    ax.set_xticklabels(QUERY_LABELS, fontsize=8)
    ax.legend()
    ax.bar_label(bars1, fontsize=7, padding=2)
    ax.bar_label(bars2, fontsize=7, padding=2)

    fig.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "query_time_before_after.png")
    fig.savefig(out_path)
    plt.close(fig)
    print(f"Saved: {out_path}")


def chart_docs_examined_before_after():
    x = np.arange(len(QUERY_LABELS))
    width = 0.35

    fig, ax = plt.subplots(figsize=(12, 6))
    bars1 = ax.bar(x - width / 2, DOCS_BEFORE, width, label="Before Index", color="#e67e22")
    bars2 = ax.bar(x + width / 2, DOCS_AFTER, width, label="After Index", color="#2980b9")

    ax.set_xlabel("Query")
    ax.set_ylabel("Documents Examined (log scale)")
    ax.set_yscale("log")
    ax.set_title("Documents Examined: Before vs After Indexing")
    ax.set_xticks(x)
    ax.set_xticklabels(QUERY_LABELS, fontsize=8)
    ax.legend()

    fig.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "docs_examined_before_after.png")
    fig.savefig(out_path)
    plt.close(fig)
    print(f"Saved: {out_path}")


def chart_execution_time_per_query():
    x = np.arange(len(QUERY_LABELS))

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(x, TIME_BEFORE, marker="o", label="Before Index", color="#e74c3c", linewidth=2)
    ax.plot(x, TIME_AFTER, marker="o", label="After Index", color="#27ae60", linewidth=2)

    ax.set_xlabel("Query")
    ax.set_ylabel("Execution Time (ms)")
    ax.set_title("Execution Time Per Query")
    ax.set_xticks(x)
    ax.set_xticklabels(QUERY_LABELS, fontsize=8)
    ax.legend()
    ax.grid(True, linestyle="--", alpha=0.5)

    fig.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "execution_time_per_query.png")
    fig.savefig(out_path)
    plt.close(fig)
    print(f"Saved: {out_path}")


def main():
    chart_query_time_before_after()
    chart_docs_examined_before_after()
    chart_execution_time_per_query()
    print("\nAll charts generated successfully in the screenshots/ folder.")


if __name__ == "__main__":
    main()
