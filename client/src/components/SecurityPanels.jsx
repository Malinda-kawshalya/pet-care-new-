import { useState } from "react";
import { Mail, Lock, Check, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../services/api.js";

export function EmailVerificationPanel({ user, onVerified }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToken, setShowToken] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter verification token");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-email", { token });
      setSuccess(data.message || "Email verified successfully!");
      setToken("");
      setError("");
      onVerified?.(data.user);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/resend-verification");
      setToken(data.verificationToken || "");
      setSuccess("New verification token generated!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend token");
    } finally {
      setLoading(false);
    }
  }

  if (user?.isEmailVerified) {
    return (
      <div className="verification-panel verified">
        <div className="verified-icon">
          <Check size={24} />
        </div>
        <h3>Email Verified</h3>
        <p>Your email address has been verified and your account is active.</p>
      </div>
    );
  }

  return (
    <div className="verification-panel">
      <div className="panel-header">
        <Mail size={20} />
        <h3>Email Verification</h3>
        <p className="panel-description">Verify your email to activate your account</p>
      </div>

      {success && <div className="form-alert success"><Check size={17} /> {success}</div>}
      {error && <div className="form-alert error"><AlertCircle size={17} /> {error}</div>}

      <form onSubmit={handleVerify} className="verification-form">
        <div className="form-group">
          <label>Verification Token</label>
          <div className="input-wrapper">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter the verification token sent to your email"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="toggle-visibility"
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="primary-button verify-btn">
            <Check size={16} /> {loading ? "Verifying..." : "Verify Email"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="secondary-button"
          >
            <ArrowRight size={16} /> Resend Token
          </button>
        </div>
      </form>

      <div className="help-text">
        <p>Check your email for the verification token. If you don't see it, check your spam folder.</p>
      </div>
    </div>
  );
}

export function PasswordResetPanel() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: request, 2: reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRequestReset(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setToken(data.resetToken || "");
      setSuccess("Reset token generated! Check your email.");
      setError("");
      setStep(2);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate reset token");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!token.trim() || !newPassword.trim()) {
      setError("Please enter token and new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        password: newPassword
      });
      setSuccess(data.message || "Password reset successfully!");
      setError("");
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setToken("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="password-reset-panel">
      <div className="panel-header">
        <Lock size={20} />
        <h3>Reset Password</h3>
        <p className="panel-description">Securely reset your account password</p>
      </div>

      {success && <div className="form-alert success"><Check size={17} /> {success}</div>}
      {error && <div className="form-alert error"><AlertCircle size={17} /> {error}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequestReset} className="reset-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={loading}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="primary-button">
            <Lock size={16} /> {loading ? "Generating..." : "Generate Reset Token"}
          </button>
          <p className="step-info">Step 1 of 2: Enter your email to receive a reset token</p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="reset-form">
          <div className="form-group">
            <label>Reset Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter the token from your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a new password (min 6 characters)"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              disabled={loading}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="secondary-button"
            >
              Back
            </button>
            <button type="submit" disabled={loading} className="primary-button">
              <Check size={16} /> {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
          <p className="step-info">Step 2 of 2: Enter your token and new password</p>
        </form>
      )}
    </div>
  );
}

export function ChangePasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });
      setSuccess(data.message || "Password changed successfully!");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="change-password-panel">
      <div className="panel-header">
        <Lock size={20} />
        <h3>Change Password</h3>
        <p className="panel-description">Update your account password</p>
      </div>

      {success && <div className="form-alert success"><Check size={17} /> {success}</div>}
      {error && <div className="form-alert error"><AlertCircle size={17} /> {error}</div>}

      <form onSubmit={handleChangePassword} className="password-form">
        <div className="form-group">
          <label>Current Password</label>
          <div className="input-wrapper">
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="toggle-visibility"
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Create a new password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            disabled={loading}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="primary-button">
          <Check size={16} /> {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="password-requirements">
        <p className="requirement-header">Password Requirements:</p>
        <ul>
          <li>At least 6 characters long</li>
          <li>Mix of uppercase and lowercase letters</li>
          <li>At least one number</li>
          <li>Not the same as your current password</li>
        </ul>
      </div>
    </div>
  );
}
