"use client"

import { useEffect, useState } from 'react';
import StoreCard from '@/components/StoreCard';
import heroBanner from '@/assets/hero-banner.jpg';
import Image from 'next/image';
import { Store } from '@/types';

const Index = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Explicitly map _id to id so components don't get 'undefined'
          const formattedStores = data.map((store: any) => ({
            ...store,
            id: store.id || store._id // Fallback to _id if id isn't present
          }));
          setStores(formattedStores);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image 
          src={heroBanner} 
          alt="Curated thrift fashion" 
          className="h-full w-full object-cover"
          priority 
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
        
        <div className="container-page absolute inset-0 flex flex-col justify-center">
          <h1 className="max-w-lg font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Pre-Loved Fashion, New Stories
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Discover unique thrift finds from curated stores. Sustainable style, delivered to your door.
          </p>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Browse Stores</h2>
          <p className="mt-2 text-muted-foreground">Each store is a treasure trove of unique finds</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stores.length > 0 ? (
              stores.map(store => (
                <StoreCard key={store.id || store._id} store={store} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No stores available yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;