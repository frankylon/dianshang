"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// ============ Admin VAR Verdict Buttons ============
export function VarVerdictButtons({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function handleVerdict(verdict: string) {
    setLoading(verdict);
    try {
      const res = await fetch("/api/admin/var", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          verdict,
          status: "resolved",
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => handleVerdict("passed")}
        disabled={!!loading}
        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "passed" ? "..." : "Pass"}
      </button>
      <button
        onClick={() => handleVerdict("remediation")}
        disabled={!!loading}
        className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading === "remediation" ? "..." : "Remediate"}
      </button>
      <button
        onClick={() => handleVerdict("failed")}
        disabled={!!loading}
        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "failed" ? "..." : "Fail"}
      </button>
    </div>
  );
}

// ============ Admin Content Approve/Reject ============
export function ContentActionButtons({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function handleAction(evidenceStatus: string) {
    setLoading(evidenceStatus);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, evidenceStatus }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <>
      <button
        onClick={() => handleAction("approved")}
        disabled={!!loading}
        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "approved" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={!!loading}
        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "rejected" ? "..." : "Reject"}
      </button>
    </>
  );
}

// ============ Admin Evidence Verify/Reject ============
export function EvidenceActionButtons({ evidenceId }: { evidenceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function handleAction(status: string) {
    setLoading(status);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evidenceId, evidenceStatus: status, type: "evidence" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="flex gap-1 justify-end">
      <button
        onClick={() => handleAction("verified")}
        disabled={!!loading}
        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "verified" ? "..." : "Verify"}
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={!!loading}
        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "rejected" ? "..." : "Reject"}
      </button>
    </div>
  );
}

// ============ Admin Merchant Verify ============
export function MerchantVerifyButton({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: merchantId, verified: true }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? "..." : "Verify"}
    </button>
  );
}

// ============ Admin User Role Editor ============
export function UserRoleEditor({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRoleChange(role: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-blue-600 hover:underline"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex gap-1">
      {["user", "merchant", "admin"].filter(r => r !== currentRole).map(role => (
        <button
          key={role}
          onClick={() => handleRoleChange(role)}
          disabled={loading}
          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 capitalize"
        >
          {role}
        </button>
      ))}
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-gray-400 px-1"
      >
        ✕
      </button>
    </div>
  );
}
