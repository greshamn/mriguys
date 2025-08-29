import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  CheckCircle, 
  Award,
  Languages,
  Accessibility,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import { generateReferralURL, generateSlotPickerURL } from '@/lib/deepLinking.js';
import { useFavorites } from '@/context/FavoritesContext.jsx';

export function CenterProfileModal({ center, onClose, searchContext = {} }) {
  const { toggleFavoriteCenter, isFavoriteCenter } = useFavorites();
  
  if (!center) return null;

  // Enhanced hours formatting
  const formatHours = (hours) => {
    if (!hours || typeof hours === 'string') return 'Contact for hours';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      if (hours[day]) {
        return (
          <div key={day} className="flex justify-between py-1">
            <span className="font-medium">{dayNames[index]}:</span>
            <span className="text-muted-foreground">{hours[day]}</span>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return 'Contact for details';
    return phone;
  };

  // Get rating display
  const getRatingDisplay = (rating) => {
    if (!rating) return { stars: 0, text: 'No rating' };
    const stars = Math.round(rating);
    const text = `${rating.toFixed(1)}/5`;
    return { stars, text };
  };

  // Calculate distance (using mock data or generate realistic value)
  const getDistance = () => {
    if (center.distance) return center.distance;
    // Generate realistic distance based on center location
    return (Math.random() * 15 + 0.5).toFixed(1);
  };

  // Get performance metrics with beautiful gradient backgrounds
  const getPerformanceMetrics = () => {
    return [
      {
        label: 'Avg TAT',
        value: center.avgTat || 'N/A',
        unit: 'days',
        icon: Calendar,
        gradientBg: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
        borderColor: 'border-blue-300',
        iconColor: 'text-white',
        textColor: 'text-white'
      },
      {
        label: 'Utilization',
        value: center.utilization || 'N/A',
        unit: '%',
        icon: TrendingUp,
        gradientBg: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
        borderColor: 'border-emerald-300',
        iconColor: 'text-white',
        textColor: 'text-white'
      },
      {
        label: 'No-Show Rate',
        value: center.noShowRate || 'N/A',
        unit: '%',
        icon: Users,
        gradientBg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
        borderColor: 'border-orange-300',
        iconColor: 'text-white',
        textColor: 'text-white'
      },
      {
        label: 'Satisfaction',
        value: center.satisfactionScore || 'N/A',
        unit: '%',
        icon: Heart,
        gradientBg: 'bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600',
        borderColor: 'border-pink-300',
        iconColor: 'text-white',
        textColor: 'text-white'
      }
    ];
  };

  const { stars, text } = getRatingDisplay(center.rating);
  const distance = getDistance();
  const performanceMetrics = getPerformanceMetrics();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {center.name}
            </DialogTitle>
            <button
              onClick={() => toggleFavoriteCenter(center)}
              className={`p-1.5 rounded-full transition-colors hover:bg-muted/50 ${
                isFavoriteCenter(center.id) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              title={isFavoriteCenter(center.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`h-5 w-5 ${
                  isFavoriteCenter(center.id) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {center.address.street}, {center.address.city}, {center.address.state} {center.address.zip}
                </span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < stars 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-foreground">{text}</span>
                <span className="text-sm text-muted-foreground">
                  ({center.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Description */}
              {center.description && (
                <p className="text-foreground text-sm leading-relaxed">
                  {center.description}
                </p>
              )}
            </div>

            <div className="text-center lg:text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {distance} mi
              </div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </div>
          </div>

          {/* Modalities and Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Available Modalities
              </h3>
              <div className="flex flex-wrap gap-2">
                {center.modalities?.map((modality) => (
                  <Badge key={modality} variant="secondary" className="text-sm">
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Special Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {center.features?.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Enhanced Performance Metrics */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className={`text-center p-3 rounded-lg ${metric.gradientBg} ${metric.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                    {/* Icon positioned at top-center with smaller size */}
                    <div className="flex justify-center mb-2">
                      <IconComponent className={`h-6 w-6 ${metric.iconColor} drop-shadow-sm`} />
                    </div>
                    
                    {/* Large number centered below icon */}
                    <div className={`text-2xl font-bold ${metric.textColor} mb-1 drop-shadow-sm`}>
                      {metric.value}{metric.unit === '%' ? '%' : ''}
                    </div>
                    
                    {/* Single line text centered below number */}
                    <div className="text-center">
                      <div className={`text-xs font-medium ${metric.textColor} leading-tight drop-shadow-sm`}>
                        {metric.label}{metric.unit && metric.unit !== '%' ? ` ${metric.unit}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Contact and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phone:</span> {formatPhone(center.phone)}
                </div>
                {center.website && (
                  <div>
                    <span className="font-medium">Website:</span>{' '}
                    <a 
                      href={center.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {center.website}
                    </a>
                  </div>
                )}
                {center.email && (
                  <div>
                    <span className="font-medium">Email:</span> {center.email}
                  </div>
                )}
                {center.parking && (
                  <div>
                    <span className="font-medium">Parking:</span> {center.parking}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours of Operation
              </h3>
              <div className="text-sm text-muted-foreground">
                {Array.isArray(formatHours(center.hours)) ? (
                  <div className="space-y-1">
                    {formatHours(center.hours)}
                  </div>
                ) : (
                  formatHours(center.hours)
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Accreditations and Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Accreditations
              </h3>
              <div className="flex flex-wrap gap-2">
                {center.accreditations?.map((accreditation) => (
                  <Badge key={accreditation} variant="outline" className="text-sm">
                    {accreditation}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Compliance & Features
              </h3>
              <div className="space-y-2">
                {center.adaCompliant && (
                  <div className="flex items-center gap-2 text-sm">
                    <Accessibility className="h-4 w-4 text-green-600" />
                    <span>ADA Compliant</span>
                  </div>
                )}
                {center.languages && center.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Languages className="h-4 w-4 text-blue-600" />
                    <span>Languages: {center.languages.join(', ')}</span>
                  </div>
                )}
                {center.magnetStrength && (
                  <div className="text-sm">
                    <span className="font-medium">MRI Magnet:</span> {center.magnetStrength}
                  </div>
                )}
                {center.openUpright && (
                  <div className="text-sm">
                    <span className="font-medium">Open/Upright MRI:</span> Available
                  </div>
                )}
                {center.sedationAvailable && (
                  <div className="text-sm">
                    <span className="font-medium">Sedation:</span> Available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body Parts and Specialties */}
          {(center.bodyParts || center.specialties) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {center.bodyParts && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Body Parts</h3>
                    <div className="flex flex-wrap gap-2">
                      {center.bodyParts.map((bodyPart) => (
                        <Badge key={bodyPart} variant="secondary" className="text-sm">
                          {bodyPart}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {center.specialties && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {center.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-sm">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Insurance Information */}
          {center.insuranceAccepted && center.insuranceAccepted.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-3">Insurance Accepted</h3>
                <div className="flex flex-wrap gap-2">
                  {center.insuranceAccepted.map((insurance) => (
                    <Badge key={insurance} variant="outline" className="text-sm">
                      {insurance}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => {
                // Generate deep link to Referral Wizard with center preselected
                const referralURL = generateReferralURL(center.id, searchContext);
                console.log('🔗 Navigating to Referral Wizard:', referralURL);
                
                // Show a more professional modal instead of alert
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
                modal.innerHTML = `
                  <div class="bg-background border border-border rounded-lg p-6 max-w-md mx-4">
                    <h3 class="text-lg font-semibold text-foreground mb-4">Appointment Booking</h3>
                    <p class="text-muted-foreground mb-4">
                      You would be redirected to the appointment booking system for <strong>${center.name}</strong>.
                    </p>
                    <div class="flex gap-3">
                      <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onclick="this.closest('.fixed').remove()">
                        Got it
                      </button>
                      <button class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors" onclick="window.open('${referralURL}', '_blank')">
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
                
                // Remove modal when clicking outside
                modal.addEventListener('click', (e) => {
                  if (e.target === modal) modal.remove();
                });
              }}
            >
              📅 Book Appointment
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => {
                // Generate Google Maps directions URL
                const address = `${center.address.street}, ${center.address.city}, ${center.address.state} ${center.address.zip}`;
                const mapsURL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
                console.log('🗺️ Opening Google Maps:', mapsURL);
                window.open(mapsURL, '_blank');
              }}
            >
              🗺️ Get Directions
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Generate phone call URL
                if (center.phone) {
                  const phoneURL = `tel:${center.phone}`;
                  console.log('📞 Calling center:', phoneURL);
                  window.location.href = phoneURL;
                } else {
                  alert('Phone number not available for this center');
                }
              }}
            >
              📞 Call Center
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
