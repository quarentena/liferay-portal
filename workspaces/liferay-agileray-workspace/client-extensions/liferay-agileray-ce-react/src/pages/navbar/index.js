import React, {useState, useRef, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom'
import { navbarData } from './navbarData.js';

function Navbar(){
    const {currentPath} = useLocation();    
    const [selitem, setselitem] = useState(null);
    const selsecitem = useRef();    
        
    const cSecondNav = selitem != null && navbarData[selitem].subItems.length ? 'secondnavbar active' : 'secondnavbar';        
    
    return(
        <>
            <div className={'navigation'} onMouseLeave={() => 
                            {selsecitem.current = null
                             setselitem(null)}}>
                <div className={'navbar'}> 
                    <nav className= {'navmenu'}>
                        <ul className= {'navlist'}>                        
                            {navbarData.map((navbarItem,index) => {
                                const cItem = selitem == index ? navbarItem.cName + ' selected' : navbarItem.cName
                                
                                return (                                                                
                                    <li key={index} className={cItem} onMouseOver={() => setselitem(index)}>
                                        <Link to={`${currentPath}/../${navbarItem.path}`} className= ' navitemlink'>
                                            {selitem == index ? navbarItem.iconSelected : navbarItem.icon}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>                
                </div>   
                {selitem != null && navbarData[selitem].subItems.length ?
                    <div className={cSecondNav}>
                        <ul className= ' navlist'> 
                            {navbarData[selitem].subItems.map((secondaryItem, index) => {                            
                                return (                                                                
                                    <li key={index} className= 'secnavitem' onMouseOver={() => selsecitem.current = index}>
                                        <Link to={`${currentPath}/../${navbarData[selitem].path}${secondaryItem.path}`} className= 'secnavitemlink'>
                                            {secondaryItem.title}
                                        </Link>                                        
                                    </li>
                                )})}
                        </ul>
                    </div>
                    : <></>}
            </div>            
        </>  
    )
}

export default Navbar;