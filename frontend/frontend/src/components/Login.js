/* Add to App.css - Make login container fixed and non-scrollable */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #10B981 100%);
  margin: 0;
  padding: 0;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  animation: fadeInUp 0.5s ease-out;
}

/* Remove body scroll when login is active */
body.login-active {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}
