import React from "react";
import styles from "./TripCard.module.css";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import { TripBeachIcon, TripExcursionIcon, TripOtherIcon } from "@/components/ui/TripIcons";
import type { Trip } from "@/types/trip";

function renderTripIcon(type: Trip["type"]) {
  switch (type) {
    case "beach":
      return <TripBeachIcon size={32} />;
    case "flight":
      return <TripExcursionIcon size={32} />;
    default:
      return <TripOtherIcon size={32} />;
  }
}

type Props = {
  trip: Trip;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const TripCard: React.FC<Props> = ({ trip, onArchive, onDelete }) => {
  const router = useRouter();

  return (
    <div className={styles.card}>
      <div className={styles.leftCol}>{renderTripIcon(trip.type)}</div>

      <div className={styles.content}>
        <h3 className={styles.title}>{trip.name}</h3>
        <p className={styles.meta}>
          Създадено: {new Date(trip.createdAt).toLocaleDateString("bg-BG")}
        </p>

        <div className={styles.actions}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push(`/trips/${trip.id}`)}
          >
            Отвори
          </Button>

          {onArchive && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onArchive(trip.id)}
            >
              Архив
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(trip.id)}
            >
              Изтрий
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
