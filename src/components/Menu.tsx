import Image from 'next/image'
import Link from 'next/link'
import menuItems from '@/shared/menuItems'
import { role } from '@/lib/data'

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((menuItem) => (
        <div className="flex flex-col gap-2" key={menuItem.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {menuItem.title}
          </span>
          {menuItem.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-SkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              )
            }
          })}
        </div>
      ))}
    </div>
  )
}

export default Menu
