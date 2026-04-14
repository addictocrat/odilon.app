
function easing(t) {
    return t - Math.sin(t * 4 * Math.PI) / (4 * Math.PI);
}

for (let i = 0; i <= 10; i++) {
    let t = i / 10;
    console.log(`t=${t.toFixed(1)}, f(t)=${easing(t).toFixed(3)}`);
}
