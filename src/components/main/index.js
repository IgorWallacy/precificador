import PrecificadorAgenda from '../../pages/precificador/agenda/precificador-dataTable-novo'
import Typing from 'react-typing-animation';
import { FcCalendar } from "react-icons/fc";

import './styles.css';

const Main = () => {
    return ( 
        <>
        
        <div className="agenda-label">
        <FcCalendar size={50}/>
          <Typing >
            
           <h1> Pesquisar notas fiscais de entrada </h1>
           <Typing.Delay ms={1000}  />
            
           <h4>Agendar os preços de venda</h4>
         
           </Typing>
           </div>
       
           <div className="container-flex">
        
        <PrecificadorAgenda />
        </div>

        </>
     );
}
 
export default Main;