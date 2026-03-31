const HOURS_TILL_EXPIRY = 9;

export const setWithExpiry = (key: string, value: unknown) => {
    const now = new Date();
    const item = {
        value,
        expiry: now.getTime() + (HOURS_TILL_EXPIRY * 60 * 60 * 1000), // Convert hours to milliseconds
    };
    localStorage.setItem(key, JSON.stringify(item));
};

export const getWithExpiry = (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
        clearAllStorageDataExceptLanguage(); // Preserve language when clearing expired data
        return null;
    }
    return item.value;
};

export const clearAllStorageDataExceptLanguage = () => {
    // Save the current language setting
    const savedLanguage = localStorage.getItem('language');

    // Clear all localStorage
    localStorage.clear();

    // Restore the language setting if it existed
    if (savedLanguage) {
        localStorage.setItem('language', savedLanguage);
    }
};

export const clearAllStorageData = () => {
    clearAllStorageDataExceptLanguage();
};

export const hasApplicationData = () => {
    const applicationId = getWithExpiry('applicationId');
    return applicationId !== null;
};
