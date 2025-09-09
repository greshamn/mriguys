import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { PatientSelector } from '@/components/PatientSelector.jsx';
import { useStore } from '@/store';
import { mockAIService } from '@/lib/MockAIService.js';
import { generateSlotPickerURL } from '@/lib/deepLinking.js';
import { CenterProfileModal } from '@/components/public/CenterProfileModal.jsx';
import { Sparkles } from 'lucide-react';
import { CenterCard } from '@/components/public/CenterCard.jsx';
import { useRole } from '@/context/RoleContext.jsx';

const steps = [
  'Patient',
  'Exam',
  'Clinical Notes',
  'Attachments',
  'Center',
  'Review'
];

const Stepper = ({ current }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium 
            ${idx <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {idx + 1}
          </div>
          <span className={`text-sm ${idx === current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
          {idx < steps.length - 1 && <Separator className="w-8" />}
        </div>
      ))}
    </div>
  );
};

export default function ReferralWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { viewingAsRole } = useRole();

  const [step, setStep] = useState(0);
  const [modality, setModality] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState([]); // metadata only
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [previewCenter, setPreviewCenter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Center filters (local to Center step)
  const [centerSearch, setCenterSearch] = useState('');
  const [minRating, setMinRating] = useState('0'); // as string for Select
  const [adaOnly, setAdaOnly] = useState(false);
  const [magnet3TOnly, setMagnet3TOnly] = useState(false);
  const [selectedInsurances, setSelectedInsurances] = useState([]);

  const store = useStore();
  const selectedPatientId = useStore(state => state.selectedPatientId || 'patient-001');
  const centers = useStore(state => state.centers || []);
  const centerLoading = useStore(state => state.loading && Array.isArray(state.centers));
  const modalityOptions = useStore(state => state.modalityOptions || []);
  const bodyParts = useStore(state => state.bodyParts || []);
  const safetyQuestions = useStore(state => state.safetyQuestions || []);

  // Prefill from deep link
  useEffect(() => {
    const deepCenter = searchParams.get('centerId');
    const deepBodyPart = searchParams.get('bodyPart');
    const deepModalities = searchParams.get('modalities');
    if (deepCenter) setSelectedCenterId(deepCenter);
    if (deepBodyPart) setBodyPart(deepBodyPart);
    if (deepModalities) setModality(deepModalities.split(',')[0]);
  }, []);

  // Initial data loads
  useEffect(() => {
    const s = useStore.getState();
    Promise.all([
      s.fetchPatients?.(),
      s.fetchBodyParts?.(),
      // Fetch centers once (unfiltered); we filter client-side to avoid slice name collisions
      s.fetchCenters?.()
    ]).catch(() => {});
  }, []);

  // Load safety preview whenever exam changes (pass params directly; avoid setFilters collisions)
  useEffect(() => {
    const s = useStore.getState();
    if (modality || bodyPart) {
      s.fetchSafetyQuestions?.({ modality, bodyPart }).catch(() => {});
    }
  }, [modality, bodyPart]);

  const contraindicationCount = useMemo(() => {
    return (safetyQuestions || []).filter(q => q.contraindication).length;
  }, [safetyQuestions]);

  // Compute body part options with graceful fallback when modality has no explicit mapping
  const { filteredBodyParts, usedFallbackForBodyParts } = useMemo(() => {
    const list = Array.isArray(bodyParts) ? bodyParts : [];
    if (!modality) return { filteredBodyParts: list, usedFallbackForBodyParts: false };
    const filtered = list.filter(bp => bp.modalities?.includes(modality));
    return {
      filteredBodyParts: filtered.length ? filtered : list,
      usedFallbackForBodyParts: filtered.length === 0
    };
  }, [bodyParts, modality]);

  const recommendations = useMemo(() => {
    if (!centers || centers.length === 0) return [];
    try {
      // Filter client-side by exam selection to avoid relying on server query params
      const filtered = centers.filter(c => {
        const examMatch = (!modality || c.modalities?.includes(modality)) && (!bodyPart || c.bodyParts?.includes(bodyPart));
        const ratingMatch = Number(minRating || '0') === 0 ? true : (c.rating || 0) >= Number(minRating);
        const adaMatch = adaOnly ? Boolean(c.adaCompliant) : true;
        const magnetMatch = magnet3TOnly ? c.magnetStrength === '3T' : true;
        const text = (centerSearch || '').trim().toLowerCase();
        const searchMatch = text
          ? (c.name?.toLowerCase().includes(text) || c.address?.city?.toLowerCase().includes(text))
          : true;
        const insuranceMatch = selectedInsurances.length === 0 || selectedInsurances.some(insurance => 
          c.insuranceAccepted && c.insuranceAccepted.includes(insurance)
        );
        return examMatch && ratingMatch && adaMatch && magnetMatch && searchMatch && insuranceMatch;
      });
      const formatted = filtered.map(c => ({ ...c, distance: c.distance || Math.round(Math.random() * 10) + 1 }));
      return mockAIService.generateRecommendations(formatted, { bodyPart, modalities: modality ? [modality] : [] });
    } catch (e) {
      return [];
    }
  }, [centers, modality, bodyPart, centerSearch, minRating, adaOnly, magnet3TOnly, selectedInsurances]);

  useEffect(() => {
    if (!selectedCenterId && recommendations.length > 0) {
      setSelectedCenterId(recommendations[0].id);
    }
  }, [recommendations, selectedCenterId]);

  const selectedCenter = useMemo(() => centers.find(c => c.id === selectedCenterId), [centers, selectedCenterId]);

  const nextEnabled = useMemo(() => {
    if (step === 0) return Boolean(selectedPatientId);
    if (step === 1) return Boolean(modality) && Boolean(bodyPart);
    if (step === 2) return true; // notes optional
    if (step === 3) return true; // attachments optional
    if (step === 4) return Boolean(selectedCenterId);
    return true;
  }, [step, selectedPatientId, modality, bodyPart, selectedCenterId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const meta = files.map(f => ({ name: f.name, size: f.size, type: f.type }));
    setAttachments(prev => [...prev, ...meta]);
  };

  const addPhrase = (text) => setNotes(n => (n ? n + '\n' : '') + text);

  const handleCreateReferral = async () => {
    setSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatientId,
        modality,
        bodyPart,
        referrerId: 'provider-001',
        clinicalNotes: notes,
        preferredCenterId: selectedCenterId,
        attachments,
      };
      const created = await useStore.getState().createReferral?.(payload);
      if (created?.id) {
        alert('Referral created successfully');
        navigate('/referrals');
      } else {
        alert('Referral created (mock)');
        navigate('/referrals');
      }
    } catch (e) {
      alert('Failed to create referral: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="col-span-12 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Referral</h1>
          <p className="text-sm text-muted-foreground">5 steps, ~90 seconds</p>
        </div>
        <Stepper current={step} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main content */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {/* Step content */}
          {step === 0 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <PatientSelector />
                <p className="text-xs text-muted-foreground">Choose an existing patient. Quick Add can be added later.</p>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Exam Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Modality</Label>
                  <Select value={modality} onValueChange={setModality}>
                    <SelectTrigger><SelectValue placeholder="Select modality" /></SelectTrigger>
                    <SelectContent>
                      {modalityOptions.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Body Part</Label>
                  <Select value={bodyPart} onValueChange={setBodyPart}>
                    <SelectTrigger><SelectValue placeholder="Select body part" /></SelectTrigger>
                    <SelectContent>
                      {filteredBodyParts.map(bp => (
                        <SelectItem key={bp.id} value={bp.name || bp.id}>{bp.name || bp.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {usedFallbackForBodyParts && modality && (
                    <div className="mt-1 text-[11px] text-muted-foreground">No specific matches for {modality}. Showing all body parts.</div>
                  )}
                </div>
                <div className="md:col-span-2 text-xs text-muted-foreground">
                  {modality && bodyPart ? (
                    <span>{contraindicationCount} safety questions flagged for this exam.</span>
                  ) : (
                    <span>Select modality and body part to preview safety screening.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Clinical Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Brief clinical context, symptoms, rule-outs"
                    className="w-full p-3 rounded-md border border-border bg-background text-foreground text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'R/O fracture',
                    'Persistent headaches ×2w',
                    'Post-MVA neck pain',
                    'Prior imaging: none'
                  ].map((p) => (
                    <Button key={p} variant="outline" size="sm" onClick={() => addPhrase(p)}>{p}</Button>
                  ))}
                </div>

                {/* Optional Doctor's Script upload */}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Doctor's Script (optional)</Label>
                  <Input type="file" accept="image/*,application/pdf" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const meta = files.map(f => ({ name: f.name, size: f.size, type: f.type, kind: 'doctor-script' }));
                    setAttachments(prev => [...prev, ...meta]);
                  }} />
                  <div className="text-[11px] text-muted-foreground mt-1">PDF or image of the referring doctor’s script. Optional.</div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Attachments (optional)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input type="file" multiple onChange={handleFileChange} />
                {attachments.length > 0 && (
                  <div className="text-sm">
                    <div className="mb-2 text-muted-foreground">Attached:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {attachments.map((f, i) => (
                        <li key={i}>{f.name} <span className="text-xs text-muted-foreground">({Math.round(f.size/1024)} KB)</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Choose Center</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                    <div className="sm:col-span-2">
                      <Input value={centerSearch} onChange={(e) => setCenterSearch(e.target.value)} placeholder="Search name or city" />
                    </div>
                    <div>
                      <Select value={minRating} onValueChange={setMinRating}>
                        <SelectTrigger><SelectValue placeholder="Min rating" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any rating</SelectItem>
                          <SelectItem value="3">3.0+</SelectItem>
                          <SelectItem value="3.5">3.5+</SelectItem>
                          <SelectItem value="4">4.0+</SelectItem>
                          <SelectItem value="4.5">4.5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="adaOnly" checked={adaOnly} onCheckedChange={(v) => setAdaOnly(Boolean(v))} />
                        <label htmlFor="adaOnly" className="text-xs text-muted-foreground">ADA</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="mag3t" checked={magnet3TOnly} onCheckedChange={(v) => setMagnet3TOnly(Boolean(v))} />
                        <label htmlFor="mag3t" className="text-xs text-muted-foreground">3T MRI</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Insurance Filter */}
                  <div>
                    <Label className="text-sm font-medium">Insurance Accepted</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Medicare', 'Medicaid'].map((insurance) => (
                        <div key={insurance} className="flex items-center space-x-2">
                          <Checkbox
                            id={`insurance-${insurance}`}
                            checked={selectedInsurances.includes(insurance)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedInsurances(prev => [...prev, insurance]);
                              } else {
                                setSelectedInsurances(prev => prev.filter(i => i !== insurance));
                              }
                            }}
                          />
                          <Label htmlFor={`insurance-${insurance}`} className="text-sm text-muted-foreground">
                            {insurance}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedInsurances.length > 0 && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInsurances([])}
                          className="text-xs"
                        >
                          Clear all
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center cards (replicate Public Finder visuals) */}
                {centerLoading ? (
                  <div className="text-sm text-muted-foreground">Loading centers…</div>
                ) : recommendations.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No centers match your filters.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((c) => (
                      <div key={c.id} onClick={() => setSelectedCenterId(c.id)}>
                        <CenterCard 
                          center={c} 
                          onClick={() => setSelectedCenterId(c.id)} 
                          selected={selectedCenterId === c.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Review & Submit</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Patient</div>
                    <div className="font-medium">{selectedPatientId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Exam</div>
                    <div className="font-medium">{modality} • {bodyPart}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground">Clinical Notes</div>
                    <div className="whitespace-pre-wrap">{notes || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Center</div>
                    <div className="font-medium">{selectedCenter?.name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Attachments</div>
                    <div>{attachments.length} file(s)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={!nextEnabled}>Next</Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => alert('Draft saved (mock)')}>Save Draft</Button>
                <Button variant="outline" onClick={() => {
                  if (!selectedCenterId) return;
                  const url = generateSlotPickerURL(selectedCenterId, { bodyPart, modalities: modality ? [modality] : [] });
                  window.open(url, '_blank');
                }}>Book Now</Button>
                <Button onClick={handleCreateReferral} disabled={submitting}>{submitting ? 'Submitting…' : 'Create Referral'}</Button>
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          {/* Hide Validation & Progress card for referrer role */}
          {viewingAsRole !== 'referrer' && (
            <Card>
              <CardHeader className="py-3"><CardTitle className="text-base">Validation & Progress</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className={`flex items-center justify-between ${selectedPatientId ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span>Patient selected</span>
                  {selectedPatientId ? '✅' : '—'}
                </div>
                <div className={`flex items-center justify-between ${(modality && bodyPart) ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span>Exam chosen</span>
                  {(modality && bodyPart) ? '✅' : '—'}
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Safety flags</span>
                  <Badge variant="secondary">{contraindicationCount}</Badge>
                </div>
                <div className={`flex items-center justify-between ${selectedCenterId ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span>Center selected</span>
                  {selectedCenterId ? '✅' : '—'}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 text-white p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <div className="font-semibold">AI Insights</div>
              </div>
              <div className="text-xs opacity-90">Top-rated centers in your area</div>
            </div>
            <CardContent className="space-y-2 text-sm">
              {recommendations.length === 0 ? (
                <div className="text-muted-foreground">Select exam to view recommendations.</div>
              ) : (
                <div>
                  <div className="font-medium">{recommendations[0].name}</div>
                  <div className="text-muted-foreground text-xs">{recommendations[0].aiReasoning}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>Score {Math.round(recommendations[0].aiScore)}</Badge>
                    <Badge variant="secondary">{recommendations[0].aiRecommendation}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {previewCenter && (
        <CenterProfileModal center={previewCenter} onClose={() => setPreviewCenter(null)} />
      )}
    </div>
  );
}


