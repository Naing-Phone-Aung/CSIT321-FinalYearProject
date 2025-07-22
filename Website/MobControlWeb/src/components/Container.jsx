import React from 'react'

const Container = ({children}) => {
  return (
    <div className='w-[85%] mx-auto font-inter text-white'>
        {children}
    </div>
  )
}

export default Container