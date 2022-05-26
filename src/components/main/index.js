import PrecificadorAgenda from '../../pages/precificador/agenda/precificador-dataTable-novo'
import Typing from 'react-typing-animation';

import './styles.css';

const Main = () => {
    return ( 
        <>
        
        <div className="agenda-label">
        <i className="pi pi-calendar" style={{'fontSize': '2em'}}></i>
          <Typing >
            
           <h1> Pesquisar notas fiscais </h1>
           <Typing.Delay ms={1000}  />
            
           <h4>Agendar preços de venda</h4>
         
           </Typing>
           </div>
       
           <div className="container-flex">
        
        <PrecificadorAgenda />
        </div>

        </>
     );
}
 
export default Main;