import { Router } from "express";
import {
    createRestaurant,
    getRestaurants,
    //updateRestaurant,
    //deleteRestaurant
} from "./restaurant.controller.js";
import{createCloudinar}from '../../middlewares/files-uploaders.js';
import{cleanUploaderFile} from '../../middlewares/delete-files-on-error.js';

const router = Router();

router.post(
    '/create',
    createCloudinar.array('images', 3),
    cleanUploaderFile,
    createRestaurant
);
router.get(
    '/', 
    getRestaurants
);
//router.put('/update/:id', updateRestaurant);
//router.delete('/delete/:id', deleteRestaurant);

export default router;
