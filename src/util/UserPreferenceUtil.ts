
class UserPreferenceUtil {
  static setIsLayoutGrid(isLayoutGrid: boolean) {
    localStorage.setItem('isLayoutGrid', isLayoutGrid + '');
  }

  static getIsLayoutGrid(): boolean {
    const isLayoutGrid: string | null = localStorage.getItem('isLayoutGrid');
    if (isLayoutGrid && isLayoutGrid === 'false') {
      return false;
    }
    // The default behavior is true
    return true;
  }

}

export default UserPreferenceUtil;
