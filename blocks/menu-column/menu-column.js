export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [title, links] = row.children;
    row.classList.add('menu-column-group');
    title?.classList.add('menu-column-title');
    links?.classList.add('menu-column-links');
  });
}
