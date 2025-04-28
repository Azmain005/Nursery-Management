import React from 'react';
import { Outlet } from 'react-router-dom';
import Aside from './nursery-comps/Aside';

const Worker = () => {
    return (
        <div className='flex gap-10 p-10'>
            <Aside></Aside>
            <Outlet></Outlet>
        </div>
    );
};

export default Worker;