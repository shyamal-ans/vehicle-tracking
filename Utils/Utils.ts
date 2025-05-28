export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
  
    const options: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
  
    return date.toLocaleString("en-US", options) ?? "-";
  };
  