import { getFirebaseAdminDb } from '../config/firebaseAdmin.js';

/**
 * Location Controller
 * Handles location data (states, districts) from Data.gov.in LGD dataset
 */

export async function getStates(req, res, next) {
  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection('states')
      .orderBy('state_name')
      .get();
    
    const states = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      states.push({
        id: doc.id,
        name: data.state_name,
        code: data.state_code,
      });
    });
    
    res.json({
      success: true,
      data: states,
      count: states.length,
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getDistricts(req, res, next) {
  try {
    const { stateCode } = req.query;
    const db = getFirebaseAdminDb();
    
    let query = db.collection('districts').orderBy('district_name');
    
    if (stateCode) {
      query = query.where('state_code', '==', stateCode);
    }
    
    const snapshot = await query.get();
    
    const districts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      districts.push({
        id: doc.id,
        name: data.district_name,
        code: data.district_code,
        stateCode: data.state_code,
      });
    });
    
    res.json({
      success: true,
      data: districts,
      count: districts.length,
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
