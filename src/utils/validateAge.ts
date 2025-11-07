export const isValidAge = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false; // chưa nhập
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 16;
};
