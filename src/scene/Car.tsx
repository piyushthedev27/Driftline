import { forwardRef } from "react";
import type { Group } from "three";
import { useSettings } from "../store";
import { Car as SportsCar } from "./SportsCar";
import { TouringCar } from "./TouringCar";
export const Car = forwardRef<Group>(function Car(_, ref) {
  const id = useSettings((s) => s.vehicleId);
  return id === "gt" ? (
    <SportsCar ref={ref} />
  ) : (
    <TouringCar key={id} kind={id} ref={ref} />
  );
});
