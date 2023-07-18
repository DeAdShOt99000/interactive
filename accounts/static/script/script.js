(function(){
    'use strict';

    const accountBtnMenu = document.querySelector('.account-btn-menu')
    document.getElementById('account-btn').addEventListener('click', function(){
        if (accountBtnMenu.style.display == 'flex'){
            accountBtnMenu.style.display = 'none';
        } else {
            accountBtnMenu.style.display = 'flex';
        }
    })

})();