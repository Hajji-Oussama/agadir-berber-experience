<template>
  <a
    href="https://wa.me/+212667858620?text=Hello!%20I%20want%20to%20book%20an%20adventure!"
    target="_blank"
    class="whatsapp-float"
    aria-label="Chat on WhatsApp"
    rel="noopener"
  >
    <i class="fab fa-whatsapp"></i>
  </a>
</template>

<style scoped lang="scss">
.whatsapp-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: #25D366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  box-shadow: 0 10px 30px rgba(37, 211, 102, 0.4);
  z-index: 9999;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  animation: pulse-whatsapp 2s infinite;
  will-change: transform;

  &:hover {
    transform: scale(1.1) rotate(-5deg);
    box-shadow: 0 15px 40px rgba(37, 211, 102, 0.6);
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 2rem;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    right: calc(1.5rem + env(safe-area-inset-right, 0px));
  }
}
</style>
