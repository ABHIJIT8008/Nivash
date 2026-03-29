const Parcel = require('../models/Parcel');
const Flat = require('../models/Flat');

// @desc    Log a new parcel at the gate (Security/Admin)
// @route   POST /api/parcels
const receiveParcel = async (req, res) => {
  try {
    const { flat_id, delivery_company } = req.body;

    if (!flat_id || !delivery_company) {
      return res.status(400).json({ message: 'Please provide flat ID and delivery company.' });
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const parcel = await Parcel.create({
      flat_id,
      delivery_company,
      otp
    });

    res.status(201).json({ message: 'Parcel logged successfully', parcel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error logging parcel' });
  }
};

// @desc    Get my flat's pending & collected parcels (Resident App)
// @route   GET /api/parcels/my-parcels
const getMyParcels = async (req, res) => {
  try {
    if (!req.user.flat_id) {
      return res.status(400).json({ message: 'No flat assigned to this user.' });
    }

    const parcels = await Parcel.find({ flat_id: req.user.flat_id }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching parcels' });
  }
};

// @desc    Verify OTP and mark parcel as collected (Security/Admin)
// @route   PUT /api/parcels/:id/verify
const verifyAndCollect = async (req, res) => {
  try {
    const { otp } = req.body;
    const parcelId = req.params.id;

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    if (parcel.status === 'Collected') {
      return res.status(400).json({ message: 'This parcel has already been collected.' });
    }

    // Check if the Resident's OTP matches the Database OTP
    if (parcel.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP! Do not hand over the package.' });
    }

    // Success! Mark it as collected.
    parcel.status = 'Collected';
    parcel.collectedAt = Date.now();
    await parcel.save();

    res.json({ message: 'OTP Verified! Package handed over successfully.', parcel });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// @desc    Get all parcels (Security/Admin)
// @route   GET /api/parcels
const getAllParcels = async (req, res) => {
  try {
    // Populate pulls in the actual Block and Flat number so the guard knows whose it is!
    const parcels = await Parcel.find()
      .populate('flat_id', 'block flat_number')
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching all parcels' });
  }
};

module.exports = {
  receiveParcel,
  getMyParcels,
  verifyAndCollect,
  getAllParcels
};