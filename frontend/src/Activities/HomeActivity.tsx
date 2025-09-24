import { useState } from 'react'
import NavBar from '../Components/NavComponent'
import InicioFragment from '../Fragments/InicioFragment'
import AADMFragment from '../Fragments/AADMFragment'
import EscuelaFragment from '../Fragments/EscuelaFragment'

const fragments = {
  Inicio: <InicioFragment />,
  AADM: <AADMFragment />,
  Escuela: <EscuelaFragment />,
}

function HomeActivity() {
  const [active, setActive] = useState('Inicio')

  return (
    <>
      <div className="min-h-screen pb-16 md:pl-20">
        {fragments[active]}
      </div>
      <NavBar active={active} setActive={setActive} />
    </>
  )
}

export default HomeActivity