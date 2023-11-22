const status = require("http-status");
const { User } = require("../../models");
const { SmartWatch } = require("../../models")
const mongoose = require("mongoose");

const saveWatchData = async (req, res) => {
  const requiredData = req.body;
  try {
    if (!req.user) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    if (typeof (requiredData.success) != "boolean" || typeof (requiredData.stepsTotal) != "number" || typeof (requiredData.stepsToday) != "number" || typeof (requiredData.stepsMonth) != "number"
      || typeof (requiredData.calTotal) != "number" || typeof (requiredData.calToday) != "number" || typeof (requiredData.calMonth) != "number" || typeof (requiredData.pace) != "number"
      || typeof (requiredData.distanceTotal) != "number" || typeof (requiredData.distanceToday) != "number" || typeof (requiredData.distanceMonth) != "number" || typeof (requiredData.distanceYear) != "number") {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
    }

    let newData = {
      success: requiredData.success,
      stepsTotal: requiredData.stepsTotal,
      stepsToday: requiredData.stepsToday,
      stepsMonth: requiredData.stepsMonth,
      calTotal: requiredData.calTotal,
      calToday: requiredData.calToday,
      calMonth: requiredData.calMonth,
      pace: requiredData.pace,
      distanceTotal: requiredData.distanceTotal,
      distanceToday: requiredData.distanceToday,
      distanceMonth: requiredData.distanceMonth,
      distanceYear: requiredData.distanceYear,
      name: req.user.firstName,
      userId: req.user._id
    }

    const smartWatchData = new SmartWatch({
      ...newData,
    })

    await smartWatchData.save();

    return res.status(200).json({ Status: true, data: smartWatchData, message: "Report data updated!" });
  } catch (error) {
    res.status(500).json({ Status: false, error: error.message });
  }
};

const getWatchData = async (req, res) => {
  try {
    const smartwatchData = await SmartWatch.find();
    if (smartwatchData.length===0) {
      return res.status(status.NOT_FOUND).json({ error: "No data found" });
    }
    res.status(status.OK).json({ Status: true, data: smartwatchData, message: "Reports fetched successfully!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getWatchDataById = async (req, res) => {
  const {id} = req.params;
  try {
    const smartwatchData = await SmartWatch.findById(id);
    if (!smartwatchData) {
      return res.status(status.NOT_FOUND).json({ error: "Report not found" });
    }

    

    res.status(status.OK).json({ Status: true, data: smartwatchData, message: "Report fetched successfully!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateWatchData = async (req, res) => {
  const { id, success, stepsTotal, stepsToday, stepsMonth, calTotal, calToday, calMonth, pace, distanceTotal, distanceToday, distanceMonth, distanceYear } = req.body;
  try {
    if (!req.user) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Invalid _id provided" });
    }

    const smartWatchData = await SmartWatch.findById(id);

    if (!smartWatchData) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Report not found" });
    }

    smartWatchData.success = success!='undefined' ? success : smartWatchData.success
    smartWatchData.stepsTotal = stepsTotal ? stepsTotal : smartWatchData.stepsTotal
    smartWatchData.stepsToday = stepsToday ? stepsToday : smartWatchData.stepsToday
    smartWatchData.stepsMonth = stepsMonth ? stepsMonth : smartWatchData.stepsMonth
    smartWatchData.calTotal = calTotal ? calTotal : smartWatchData.calTotal
    smartWatchData.calToday = calToday ? calToday : smartWatchData.calToday
    smartWatchData.calMonth = calMonth ? calMonth : smartWatchData.calMonth
    smartWatchData.pace = pace ? pace : smartWatchData.pace
    smartWatchData.distanceTotal = distanceTotal ? distanceTotal : smartWatchData.distanceTotal
    smartWatchData.distanceToday = distanceToday ? distanceToday : smartWatchData.distanceToday
    smartWatchData.distanceMonth = distanceMonth ? distanceMonth : smartWatchData.distanceMonth
    smartWatchData.distanceYear = distanceYear ? distanceYear : smartWatchData.distanceYear

    const updatedData = await smartWatchData.save();

    return res.status(200).json({ Status: true, data: updatedData, message: "Report updated!" });
  } catch (error) {
    res.status(500).json({ Status: false, error: error.message });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedData = await SmartWatch.findByIdAndDelete(id);
    if (!deletedData) {
      return res.status(status.NOT_FOUND).json({ error: "Report not found" });
    }
    res.status(status.OK).send({ Status: true, message: "Report delete successfully!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};



module.exports = {
  saveWatchData,
  getWatchData,
  updateWatchData,
  getWatchDataById,
  deleteData
};
