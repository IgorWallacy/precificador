import './styles.css';

import Argon from '../../assets/img/argon-white.png'

const Header = () => {
    return (
        <>
        <div className="header-item">
         <img  style={{ width: '120px'}} 
         src={Argon} alt="img" />
        </div>
        </>
      );
}
 
export default Header;