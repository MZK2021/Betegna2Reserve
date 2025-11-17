import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface Room {
  id: string
  country: string
  city: string
  area: string
  roomType: string
  priceMonthly: number
  bedsAvailable: number
  bedsTotal: number
  status: string
  ratingAvg?: number
  ratingCount?: number
}

export function MyRoomsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: async () => {
      const res = await api.get<Room[]>('/rooms/my-rooms')
      return res.data
    },
    enabled: !!user
  })

  const deleteMutation = useMutation({
    mutationFn: async (roomId: string) => {
      await api.delete(`/rooms/${roomId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] })
    }
  })

  const myRooms = rooms || []

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Please log in to manage your rooms</h2>
        <p className="text-sm text-muted mt-4">
          You need to be logged in to create and manage room listings.
        </p>
        <div className="flex gap-2 mt-4" style={{ justifyContent: 'center' }}>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
          <Link to="/signup" className="btn-secondary">
            Sign Up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>{t('myRooms.title')}</h2>
        <button className="btn-primary" onClick={() => navigate('/rooms/create')}>
          {t('myRooms.createNew')}
        </button>
      </div>

      {isLoading && <div className="card">Loading your rooms...</div>}

      {!isLoading && myRooms.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 className="mb-4">No rooms yet</h3>
          <p className="text-sm text-muted mb-4">
            Start by creating your first room listing to connect with potential tenants.
          </p>
          <button className="btn-primary" onClick={() => navigate('/rooms/create')}>
            {t('myRooms.createNew')}
          </button>
        </div>
      )}

      {!isLoading && myRooms.length > 0 && (
        <div className="rooms-grid">
          {myRooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-content">
                <div className="room-card-title">
                  {room.city}, {room.area}
                </div>
                <div className="room-card-meta">
                  {room.country} • {room.roomType} • Status: {room.status}
                </div>
                <div className="room-card-price">
                  {room.priceMonthly} AED <span className="text-sm text-muted">{t('rooms.perMonth')}</span>
                </div>
                <div className="text-sm text-muted mt-2">
                  {room.bedsAvailable} of {room.bedsTotal} beds available
                </div>
                {room.ratingAvg && (
                  <div className="room-card-rating mt-2">
                    ⭐ {room.ratingAvg.toFixed(1)} {room.ratingCount !== undefined && room.ratingCount !== null && room.ratingCount > 0 ? `(${room.ratingCount} reviews)` : '(No reviews)'}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Link to={`/rooms/${room.id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                    View
                  </Link>
                  <Link to={`/rooms/${room.id}/edit`} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                    Edit
                  </Link>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this room?')) {
                        deleteMutation.mutate(room.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

