export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showAutomationCompleteNotification = (data: {
  successful: number;
  total: number;
  success_rate: number;
  duration: number;
}) => {
  if (Notification.permission !== "granted") return;

  const notification = new Notification("🎉 ScopeAI Automation Complete!", {
    body: `Successfully applied to ${data.successful} out of ${data.total} jobs!\nSuccess Rate: ${data.success_rate}%\nDuration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
    icon: "/logo.png",
    badge: "/badge.png",
    tag: "automation-complete",
    requireInteraction: true, // Keeps notification until user interacts
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    // Navigate to applications page
    window.location.href = "/applications";
  };
};