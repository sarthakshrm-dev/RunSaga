const status = require("http-status");
const jwt = require("jsonwebtoken");
const { Runs, Saga } = require("../../models");
const mongoose = require('mongoose')

const quickRun = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const randomSaga = await Saga.aggregate([
            { $sample: { size: 1 } },
            {
                $lookup: {
                    from: "Category",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "Voice",
                    localField: "voice",
                    foreignField: "_id",
                    as: "voice"
                }
            }
        ]);

        if (randomSaga.length === 0) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        return res.status(200).json({ Status: true, data: randomSaga[0], message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};


const startRun = async (req, res) => {
    try {
        const { sagaId, quickRun, quickRunMode } = req.body;

        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (typeof (sagaId) != "string" || typeof (quickRun) != "boolean" || typeof (quickRunMode) != "string") {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
        }

        var run = {
            userId: req.user._id,
            sagaId: sagaId,
            calories: 0,
            distance: 0,
            pace: 0,
            steps: 0,
            status: 'running',
            quickRun: quickRun
        }

        if (quickRun) {
            if (!quickRunMode) {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Quick run mode is required!" });
            } else {
                run.quickRunMode = quickRunMode;
            }
        }

        const runData = new Runs(run)

        await runData.save();

        return res.status(200).json({ Status: true, data: runData, message: "Run started!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const pauseResume = async (req, res) => {
    const { id } = req.params;
    try {
        const { sagaStatus } = req.body;

        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (typeof (sagaStatus) != "string") {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
        }

        const runData = await Runs.findById(id)

        if (sagaStatus === 'resume') {
            if (runData.status === 'paused') {
                runData.status = 'running';
                runData.tryAgain = false;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        }
        else if (sagaStatus === 'pause') {
            if (runData.status === 'running') {
                runData.status = 'paused';
                runData.tryAgain = false;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        } else {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
        }

        await runData.save();

        return res.status(200).json({ Status: true, data: runData, message: "Run ended!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const endRun = async (req, res) => {
    const { id } = req.params;
    try {
        const { calories, distance, pace, steps, sagaStatus } = req.body;

        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (typeof (calories) != "number" || typeof (pace) != "number" || typeof (distance) != "number" || typeof (steps) != "number" || typeof (sagaStatus) != "string") {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
        }

        const runData = await Runs.findById(id)

        if (sagaStatus === 'running') {
            if (runData.status === 'paused') {
                runData.status = 'running';
                runData.tryAgain = false;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        }
        else if (sagaStatus === 'paused') {
            if (runData.status === 'running') {
                runData.status = 'paused';
                runData.tryAgain = false;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        } else if (sagaStatus === 'game over') {
            if (runData.status === 'running') {
                runData.status = 'game over';
                runData.tryAgain = true;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        }
        else if (sagaStatus === 'ended') {
            if (runData.status === 'running' || runData.status === 'paused') {
                runData.status = 'ended';
                runData.tryAgain = false;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        }
        else if (sagaStatus === 'win') {
            if (runData.status === 'running') {
                runData.status = 'win';
                runData.tryAgain = false;
                runData.success = true;
            }
            else {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
            }
        }

        runData.calories = calories;
        runData.distance = distance;
        runData.pace = pace;
        runData.steps = steps;

        await runData.save();

        return res.status(200).json({ Status: true, data: runData, message: "Run ended!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getRuns = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const { searchCriteria } = req.query;

        const matchQuery = {
            userId: req.user._id,
        };

        const pipeline = [
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: 'SagaSchema',
                    localField: '_id',
                    foreignField: 'saga',
                    as: 'saga',
                },
            },
            {
                $addFields: {
                    saga: { $arrayElemAt: ['$saga', 0] },
                    sagaName: '$saga.name',
                    sagaThumbnail: '$saga.thumbnail',
                },
            },
        ];

        const runData = await Runs.aggregate(pipeline);

        return res.status(200).json({ Status: true, data: runData, message: "Runs retrieved!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getRunById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const runData = await Runs.aggregate([
            {
                $lookup: {
                    from: 'SagaScheme',
                    localField: '_id',
                    foreignField: 'saga',
                    as: 'saga',
                },
            },
            {
                $addFields: {
                    averageOverallRating: '$saga.title'
                },
            },
            {
                $match: filter,
            },
        ])

        return res.status(200).json({ Status: true, data: runData, message: "Run started!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};


const tryAgain = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const runData = await Runs.findById(id)


        if (runData.status === 'game over') {
            runData.status = 'running';
            runData.tryAgain = false;
        }
        else {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid status!" });
        }

        await runData.save();

        return res.status(200).json({ Status: true, data: runData, message: "Run ended!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

module.exports = {
    quickRun,
    startRun,
    endRun,
    getRuns,
    getRunById,
    pauseResume,
    tryAgain
}

