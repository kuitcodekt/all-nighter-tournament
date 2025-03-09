// script.js (ステップ 2)
console.log("script.js loaded!");

window.addEventListener('load', () => {
    alert("Page loaded!");

    // NoSleep.js のテスト
    let noSleep = new NoSleep();

    function enableNoSleep() {
        noSleep.enable();
        document.removeEventListener('touchstart', enableNoSleep, false);
        document.removeEventListener('click', enableNoSleep, false); //PCでの対応
        console.log("NoSleep enabled!");
    }

    document.addEventListener('touchstart', enableNoSleep, false);
    document.addEventListener('click', enableNoSleep, false); //PCでの対応

});
