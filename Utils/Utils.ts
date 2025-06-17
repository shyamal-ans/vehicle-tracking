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
  
export const getTodayDateStrings = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const startDate = `${yyyy}-${mm}-${dd} 00:00:00`;
  const endDate = `${yyyy}-${mm}-${dd} 23:59:59`;

  return { startDate, endDate };
};

