import React from "react";
import styles from "./TripTypeSelector.module.css";
import type { TripType } from "@/types/trip";

type Props = {
  onSelect: (type: TripType) => void;
};

const TripTypeSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className={styles.wrapper}>
      {/* МОРЕ */}
      <button
        type="button"
        className={styles.typeBtn}
        onClick={() => onSelect("beach")}
      >
        <span className={styles.emoji} aria-hidden="true">
          🏖️
        </span>
        <span className={styles.label}>Море</span>
      </button>

      {/* ЕКСКУРЗИЯ / ПОЛЕТ */}
      <button
        type="button"
        className={styles.typeBtn}
        onClick={() => onSelect("flight")}
      >
        <span className={styles.emoji} aria-hidden="true">
          ✈️
        </span>
        <span className={styles.label}>Екскурзия</span>
      </button>

      {/* ДРУГО */}
      <button
        type="button"
        className={styles.typeBtn}
        onClick={() => onSelect("other")}
      >
        <span className={styles.emoji} aria-hidden="true">
          🧳
        </span>
        <span className={styles.label}>Друго</span>
      </button>
    </div>
  );
};

export default TripTypeSelector;
