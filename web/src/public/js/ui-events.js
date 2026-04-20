export const showToast = ({
  message,
  type = 'info',
  title = ''
}) => {
  window.dispatchEvent(
    new CustomEvent('marketplace-toast', {
      detail: {
        message,
        type,
        title
      }
    })
  );
};