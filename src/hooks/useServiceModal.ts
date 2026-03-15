"use client";

import { useState } from "react";
import type { ServiceModalData } from "@/components/ServiceModal";

export function useServiceModal() {
  const [selectedService, setSelectedService] = useState<ServiceModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openServiceModal = (service: ServiceModalData) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsModalOpen(false);
    // Delay clearing the selected service to allow close animation
    setTimeout(() => setSelectedService(null), 300);
  };

  return {
    selectedService,
    isModalOpen,
    openServiceModal,
    closeServiceModal,
    setIsModalOpen
  };
}
