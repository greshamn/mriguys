import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function AITip({ tip, type = 'general', className }) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md overflow-hidden",
      className
    )}>
      {/* Purple Header Section - matches AI Insights */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-bold text-lg">AI Insights</h3>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          Top-rated centers in your area
        </p>
      </div>
      
      {/* Content Section */}
      <CardContent className="p-4">
        <p className="text-sm text-foreground leading-relaxed">
          {tip}
        </p>
      </CardContent>
    </Card>
  );
}

// Enhanced Mock AI service for generating contextual tips
export const generateAITip = (appointment, patient, reports = [], previousAppointments = []) => {
  if (!appointment) {
    return {
      tip: "Schedule your next imaging appointment to continue your care journey.",
      type: "general",
      priority: "low",
      actionable: false
    };
  }

  const tips = [];
  const appointmentDate = new Date(appointment.startTime);
  const now = new Date();
  const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);
  const daysUntil = Math.ceil(hoursUntil / 24);

  // Rule 1: Urgent time-based advice (highest priority)
  if (hoursUntil <= 2 && hoursUntil > 0) {
    tips.push({
      tip: "Your appointment is in less than 2 hours! Ensure you've completed all preparation steps and are ready to leave soon.",
      type: "urgent",
      priority: "high",
      actionable: true
    });
  } else if (hoursUntil <= 24 && hoursUntil > 2) {
    tips.push({
      tip: "Your appointment is within 24 hours. Double-check your preparation checklist and plan your route to the center.",
      type: "preparation",
      priority: "high",
      actionable: true
    });
  }

  // Rule 2: Advanced modality-specific advice
  if (appointment.modality === 'MRI') {
    if (appointment.bodyPart === 'Head' || appointment.bodyPart === 'Brain') {
      tips.push({
        tip: "For your brain MRI, avoid caffeine 4 hours before the scan as it can affect blood flow patterns. Remove all metal jewelry and hair accessories.",
        type: "preparation",
        priority: "medium",
        actionable: true
      });
    } else if (appointment.bodyPart === 'Spine') {
      tips.push({
        tip: "Spine MRI scans typically take 45-60 minutes. Practice relaxation techniques and inform the technologist if you experience claustrophobia.",
        type: "preparation",
        priority: "medium",
        actionable: true
      });
    } else {
      tips.push({
        tip: "Remove all metal objects before your MRI scan. Arrive 15 minutes early for safety screening and wear comfortable, loose-fitting clothes.",
        type: "preparation",
        priority: "medium",
        actionable: true
      });
    }
  } else if (appointment.modality === 'CT') {
    if (appointment.bodyPart === 'Abdomen' || appointment.bodyPart === 'Pelvis') {
      tips.push({
        tip: "You may need to fast for 4 hours before your abdominal CT scan. Drink the contrast solution as instructed by your center.",
        type: "preparation",
        priority: "high",
        actionable: true
      });
    } else {
      tips.push({
        tip: "CT scans are quick (5-10 minutes). Wear comfortable clothing without metal zippers or buttons for optimal image quality.",
        type: "preparation",
        priority: "medium",
        actionable: true
      });
    }
  } else if (appointment.modality === 'X-Ray') {
    tips.push({
      tip: "X-rays are the quickest imaging procedure. Remove jewelry in the area being scanned and wear clothing without metal fasteners.",
      type: "preparation",
      priority: "low",
      actionable: true
    });
  } else if (appointment.modality === 'Ultrasound') {
    if (appointment.bodyPart === 'Abdomen') {
      tips.push({
        tip: "For abdominal ultrasound, you may need to fast for 8-12 hours. Drink water 1 hour before to ensure a full bladder if instructed.",
        type: "preparation",
        priority: "high",
        actionable: true
      });
    } else {
      tips.push({
        tip: "Ultrasound is non-invasive and painless. Wear comfortable, loose-fitting clothing that allows easy access to the area being examined.",
        type: "preparation",
        priority: "low",
        actionable: true
      });
    }
  }

  // Rule 3: Patient history and risk factors
  if (patient?.pipFlag) {
    tips.push({
      tip: "As a PIP patient, bring your attorney contact information and document any symptom changes since your accident for your medical records.",
      type: "documentation",
      priority: "medium",
      actionable: true
    });
  }

  // Rule 4: Previous appointment patterns
  if (previousAppointments.length > 0) {
    const lastAppointment = previousAppointments[0];
    if (lastAppointment.modality === appointment.modality && lastAppointment.bodyPart === appointment.bodyPart) {
      tips.push({
        tip: "This is a follow-up scan of the same area. The technologist may compare today's images with your previous results for better analysis.",
        type: "information",
        priority: "low",
        actionable: false
      });
    }
  }

  // Rule 5: Results availability prediction
  if (reports.length > 0) {
    tips.push({
      tip: "You have previous results available. Your new scan results will typically be ready within 24-48 hours and compared to your baseline.",
      type: "information",
      priority: "low",
      actionable: false
    });
  }

  // Rule 6: Weather and seasonal considerations
  const month = appointmentDate.getMonth();
  if (daysUntil <= 3 && (month === 11 || month === 0 || month === 1)) { // Winter months
    tips.push({
      tip: "Winter weather alert: Check traffic conditions and allow extra travel time. Dress in layers for easy removal during your scan.",
      type: "travel",
      priority: "medium",
      actionable: true
    });
  }

  // Rule 7: Center-specific advice (mock center intelligence)
  if (appointment.center?.name?.includes('Beach')) {
    tips.push({
      tip: "This coastal center often has limited parking. Consider arriving 20 minutes early to secure parking and complete check-in.",
      type: "logistics",
      priority: "medium",
      actionable: true
    });
  }

  // Sort tips by priority and return the most relevant one
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
  tips.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return tips.length > 0 ? tips[0] : {
    tip: "Follow your preparation instructions and arrive on time for the best experience.",
    type: "general",
    priority: "low",
    actionable: false
  };
};
