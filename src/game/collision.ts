import { nearest, obstacles } from "./track";

// Envelope includes the bumpers, mirrors, tyres and rear wing, not just the chassis centre.
export const CAR_HALF_WIDTH = 1.27;
export const CAR_HALF_LENGTH = 2.53;
export const RAIL_INNER_LIMIT = 9.4;
type Body = { x: number; z: number; yaw: number; vx: number; vz: number };
type Contact = (nx: number, nz: number, closingSpeed: number) => void;

export function footprint(body: Pick<Body, "x" | "z" | "yaw">) {
  const c = Math.cos(body.yaw),
    s = Math.sin(body.yaw);
  return [-CAR_HALF_LENGTH, 0, CAR_HALF_LENGTH].flatMap((z) =>
    [-CAR_HALF_WIDTH, CAR_HALF_WIDTH].map((x) => ({
      x: body.x + c * x + s * z,
      z: body.z - s * x + c * z,
    })),
  );
}

function respond(body: Body, nx: number, nz: number, contact: Contact) {
  const inward = body.vx * nx + body.vz * nz;
  if (inward < 0) {
    // Reject motion through the wall every step, even while event feedback is on cooldown.
    body.vx -= nx * inward * 1.12;
    body.vz -= nz * inward * 1.12;
  }
  contact(nx, nz, Math.max(0, -inward));
}

export function containVehicle(body: Body, contact: Contact) {
  for (let iteration = 0; iteration < 8; iteration++) {
    let depth = 0,
      nx = 0,
      nz = 0;
    for (const corner of footprint(body)) {
      const road = nearest(corner.x, corner.z),
        overlap = road.distance - RAIL_INNER_LIMIT;
      if (overlap > depth) {
        depth = overlap;
        nx = (road.p.x - corner.x) / road.distance;
        nz = (road.p.z - corner.z) / road.distance;
      }
    }
    if (depth < 0.00001) break;
    body.x += nx * (depth + 0.025);
    body.z += nz * (depth + 0.025);
    respond(body, nx, nz, contact);
  }
}

export function resolveCollisions(body: Body, contact: Contact) {
  const c = Math.cos(body.yaw),
    s = Math.sin(body.yaw);
  for (const obstacle of obstacles) {
    const dx = obstacle.x - body.x,
      dz = obstacle.z - body.z;
    if (dx * dx + dz * dz > 25) continue;
    const x = dx * c - dz * s,
      z = dx * s + dz * c;
    const qx = Math.max(-CAR_HALF_WIDTH, Math.min(CAR_HALF_WIDTH, x));
    const qz = Math.max(-CAR_HALF_LENGTH, Math.min(CAR_HALF_LENGTH, z));
    let nx = qx - x,
      nz = qz - z,
      distance = Math.hypot(nx, nz),
      penetration = obstacle.radius - distance;
    if (penetration <= 0) continue;
    if (distance < 0.0001) {
      const ex = CAR_HALF_WIDTH - Math.abs(x),
        ez = CAR_HALF_LENGTH - Math.abs(z);
      if (ex < ez) {
        nx = -Math.sign(x || 1);
        nz = 0;
        penetration = obstacle.radius + ex;
      } else {
        nx = 0;
        nz = -Math.sign(z || 1);
        penetration = obstacle.radius + ez;
      }
      distance = 1;
    }
    nx /= distance;
    nz /= distance;
    const wx = nx * c + nz * s,
      wz = -nx * s + nz * c;
    body.x += wx * (penetration + 0.025);
    body.z += wz * (penetration + 0.025);
    respond(body, wx, wz, contact);
  }
  // Correct after obstacles too, so a cone cannot push the car into a rail.
  containVehicle(body, contact);
}
