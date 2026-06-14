const db = require("../db/db");

exports.saveAuditLog = (userId, action) => {
  db.query(
    "INSERT INTO audit_logs (user_id, action) VALUES (?, ?)",
    [userId, action],
    (err) => {
      if (err) {
        console.error("Audit Log Error:", err.message);
      }
    }
  );
};