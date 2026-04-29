export const checkEligibilityLocal = (user: any): boolean => {
  if (!user) return false;
  
  if (user.status && user.status !== 'Available') return false;
  
  if (user.lastDonation && user.lastDonation !== 'Never') {
    const lastDate = new Date(user.lastDonation);
    if (!isNaN(lastDate.getTime())) {
      const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 90) { // 3 months required gap
        return false;
      }
    }
  }
  
  return true;
};
