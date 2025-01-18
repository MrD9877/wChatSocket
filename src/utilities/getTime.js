export function getDate(string) {
  const now = new Date(string);
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let date = now.getDate();

  // Format as hh:mm AM/PM
  const formattedTime = `${date} ${month} ${year}`;
  return formattedTime;
}
