'use strict'

import Table from './table.model.js';

export const createTable = async (req, res) => {
    try {
        const data = req.body;

        const table = new Table(data);
        await table.save();

        return res.status(200).send({
            success: true,
            message: 'Mesa creada correctamente',
            table
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al crear la mesa',
            error: err.message
        });
    }
};

export const getTables = async (req, res) => {
    try {
        const tables = await Table.find().populate('restaurant');

        return res.status(200).send({
            success: true,
            tables
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al obtener las mesas',
            error: err.message
        });
    }
};
