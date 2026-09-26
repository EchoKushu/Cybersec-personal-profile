const search = document.getElementById('attack-search');
const cards = [...document.querySelectorAll('.attack-card')];
document.querySelector('.search-tools').hidden = false;
function filterAttacks() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    cards.forEach(card => {
        card.hidden = !card.textContent.toLowerCase().includes(query);
        if (!card.hidden) count++;
    });
    document.querySelectorAll('.attack-category').forEach(category => {
        category.hidden = ![...category.querySelectorAll('.attack-card')].some(card => !card.hidden);
    });
    document.getElementById('search-status').textContent = `Showing ${count} of 30 attack types`;
    document.getElementById('no-results').hidden = count !== 0;
}
search.addEventListener('input', filterAttacks);
document.getElementById('clear-search').addEventListener('click', () => {
    search.value = '';
    filterAttacks();
    search.focus();
});
document.querySelectorAll('.contents a').forEach(link => link.addEventListener('click', () => {
    search.value = '';
    filterAttacks();
}));
