import menuItems from '@/shared/menuItems'

const Menu = () => {
  return (
    <div>
      {menuItems.map((menuItem) => (
        <div className="" key={menuItem.title}>
          <span>{menuItem.title}</span>
        </div>
      ))}
    </div>
  )
}

export default Menu
