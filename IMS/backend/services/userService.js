const { pool } = require("../config/database");

async function ensureAuthProviderUser(identity) {
  const email = String(identity.email || "").toLowerCase();
  const name = identity.name || email.split("@")[0] || "IMS User";
  const subject = identity.subject || email;

  const [existing] = await pool.execute(
    `SELECT id FROM users WHERE auth_provider_subject = ? OR email = ? LIMIT 1`,
    [subject, email]
  );

  let userId = existing[0]?.id;
  if (userId) {
    await pool.execute(
      `UPDATE users
       SET auth_provider_subject = ?, email_verified = ?, full_name = COALESCE(NULLIF(full_name, ''), ?)
       WHERE id = ?`,
      [subject, identity.email_verified ? 1 : 0, name, userId]
    );
  } else {
    const [result] = await pool.execute(
      `INSERT INTO users (auth_provider_subject, full_name, email, email_verified, account_status, is_active)
       VALUES (?, ?, ?, ?, 'active', 1)`,
      [subject, name, email, identity.email_verified ? 1 : 0]
    );
    userId = result.insertId;
    await assignDefaultRequesterRole(userId);
  }

  return getUserProfile(userId);
}

async function assignDefaultRequesterRole(userId) {
  const [roles] = await pool.execute("SELECT id FROM roles WHERE name = 'Requester' LIMIT 1");
  if (!roles[0]) return;
  await pool.execute(
    `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
    [userId, roles[0].id]
  );
}

async function getUserProfile(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.auth_provider_subject, u.full_name, u.email, u.email_verified, u.account_status, u.is_active,
            GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') AS roles,
            GROUP_CONCAT(DISTINCT p.permission_key ORDER BY p.permission_key SEPARATOR ',') AS permissions
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId]
  );
  const user = rows[0];
  if (!user) return null;
  return {
    id: user.id,
    subject: user.auth_provider_subject,
    name: user.full_name,
    email: user.email,
    email_verified: Boolean(user.email_verified),
    status: user.account_status || (user.is_active ? "active" : "inactive"),
    roles: user.roles ? user.roles.split(",") : [],
    permissions: user.permissions ? user.permissions.split(",") : []
  };
}

module.exports = {
  ensureAuthProviderUser,
  getUserProfile
};
