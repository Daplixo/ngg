/**
 * Settings Buttons Fix
 * Forces theme toggle and delete account buttons to have identical styling
 */

(function() {
    function fixSettingsButtons() {
        // Get the theme toggle and delete account buttons
        const themeToggle = document.getElementById('theme-toggle');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        
        if (!themeToggle || !deleteAccountBtn) {
            console.log("Settings buttons not found, will retry later");
            return;
        }
        
        // Get the computed style of the delete account button to use as reference
        const deleteAccountStyle = window.getComputedStyle(deleteAccountBtn);
        
        // Apply delete account button styles to theme toggle
        themeToggle.style.width = deleteAccountStyle.width;
        themeToggle.style.minWidth = deleteAccountStyle.width;
        themeToggle.style.boxSizing = "border-box";
        themeToggle.style.padding = deleteAccountStyle.padding;
        themeToggle.style.display = "flex";
        
        // Get the content elements
        const themeContent = themeToggle.querySelector('.theme-option-content');
        const deleteContent = deleteAccountBtn.querySelector('.theme-option-content');
        
        if (themeContent && deleteContent) {
            const deleteContentStyle = window.getComputedStyle(deleteContent);
            themeContent.style.display = "flex";
            themeContent.style.alignItems = "center";
            themeContent.style.width = "100%";
        }
        
        // Get the icon containers
        const themeIcon = themeToggle.querySelector('.icon-container');
        const deleteIcon = deleteAccountBtn.querySelector('.icon-container');
        
        if (themeIcon && deleteIcon) {
            const deleteIconStyle = window.getComputedStyle(deleteIcon);
            themeIcon.style.width = deleteIconStyle.width;
            themeIcon.style.height = deleteIconStyle.height;
            themeIcon.style.minWidth = deleteIconStyle.minWidth;
            themeIcon.style.marginRight = deleteIconStyle.marginRight;
            themeIcon.style.flexShrink = "0";
        }
        
        // Get the text spans
        const themeSpan = themeToggle.querySelector('span');
        const deleteSpan = deleteAccountBtn.querySelector('span');
        
        if (themeSpan && deleteSpan) {
            const deleteSpanStyle = window.getComputedStyle(deleteSpan);
            themeSpan.style.fontSize = deleteSpanStyle.fontSize;
            themeSpan.style.whiteSpace = "nowrap";
            themeSpan.style.overflow = "hidden";
            themeSpan.style.textOverflow = "ellipsis";
        }
        
        console.log("Settings buttons fixed to have consistent styling");
    }
    
    // Run immediately
    fixSettingsButtons();
    
    // Run after DOM is fully loaded
    document.addEventListener('DOMContentLoaded', fixSettingsButtons);
    
    // Run after a delay to catch late DOM changes
    setTimeout(fixSettingsButtons, 500);
    setTimeout(fixSettingsButtons, 1000);
    
    // Watch for potential menu interactions
    document.addEventListener('click', function(e) {
        if (e.target && (
            e.target.id === 'settings-button' || 
            e.target.closest('#settings-button') ||
            e.target.id === 'theme-toggle' ||
            e.target.closest('#theme-toggle') ||
            e.target.id === 'delete-account-btn' ||
            e.target.closest('#delete-account-btn')
        )) {
            setTimeout(fixSettingsButtons, 50);
        }
    });
    
    // Add global function for manual execution if needed
    window.fixSettingsButtons = fixSettingsButtons;
})();
