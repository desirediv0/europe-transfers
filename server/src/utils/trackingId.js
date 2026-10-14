import crypto from "crypto";

// Tracking IDs look like "TET48213": the letters TET plus 5 random digits.
// Random (not sequential) so an ID does not reveal how many orders exist.
// `exists` is a function that returns true when the ID is already used.
export const generateTrackingId = async (exists) => {
  for (let attempt = 0; attempt < 30; attempt++) {
    const id = `TET${crypto.randomInt(10000, 100000)}`;
    if (!(await exists(id))) return id;
  }
  // 5 digits only gives 90,000 IDs; if that space is crowded, widen to 6
  // digits rather than failing a booking.
  for (let attempt = 0; attempt < 30; attempt++) {
    const id = `TET${crypto.randomInt(100000, 1000000)}`;
    if (!(await exists(id))) return id;
  }
  throw new Error("Could not generate a unique tracking ID");
};
