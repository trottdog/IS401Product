import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Platform, ActivityIndicator, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Club, Building, Category, ClubMembership } from "@/lib/types";
import * as store from "@/lib/api/store";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

const STEPS = ["Basic Info", "Details", "Review & Create"];

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const layout = useResponsiveLayout();
  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;
  const bottomInset = Platform.OS === "web" ? layout.tabBarHeight : 49 + insets.bottom;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);

  const [title, setTitle] = useState("");
  const [clubId, setClubId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [room, setRoom] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [hasFood, setHasFood] = useState(false);
  const [foodDescription, setFoodDescription] = useState("");
  const [hasLimitedCapacity, setHasLimitedCapacity] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [allClubs, allBuildings, allCategories, userMemberships] = await Promise.all([
        store.getClubs(),
        store.getBuildings(),
        store.getCategories(),
        store.getMemberships(user.id),
      ]);
      setClubs(allClubs);
      setBuildings(allBuildings);
      setCategories(allCategories);
      setMemberships(userMemberships);
      setLoading(false);
    })();
  }, [user]);

  const userClubs = clubs.filter(c => memberships.some(m => m.clubId === c.id));

  const validateStep1 = () => {
    if (!title.trim()) return "Please enter an event title";
    if (!clubId) return "Please select a club";
    if (!categoryId) return "Please select a category";
    if (!buildingId) return "Please select a building";
    if (!room.trim()) return "Please enter a room number";
    return "";
  };

  const validateStep2 = () => {
    if (!date.trim()) return "Please enter a date";
    if (!startTime.trim()) return "Please enter a start time";
    if (!endTime.trim()) return "Please enter an end time";
    if (!description.trim()) return "Please enter a description";
    return "";
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    } else if (step === 1) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError("");
    setStep(s => s - 1);
  };

  const handleCreate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreating(true);
    try {
      const isoStart = new Date(`${date}T${startTime}:00`).toISOString();
      const isoEnd = new Date(`${date}T${endTime}:00`).toISOString();
      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

      await store.createEvent({
        title: title.trim(),
        description: description.trim(),
        clubId,
        buildingId,
        categoryId,
        startTime: isoStart,
        endTime: isoEnd,
        room: room.trim(),
        hasLimitedCapacity,
        maxCapacity: hasLimitedCapacity && maxCapacity ? parseInt(maxCapacity, 10) : null,
        hasFood,
        foodDescription: hasFood && foodDescription.trim() ? foodDescription.trim() : null,
        tags: parsedTags,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setError("Failed to create event. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getClubName = (id: string) => clubs.find(c => c.id === id)?.name ?? "";
  const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name ?? "";
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? "";

  if (loading) {
    return (
      <PageShell>
        <View style={[styles.loadingContainer, { paddingTop: topInset }]}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={12} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.topBarTitle}>Create Event</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.progressContainer}>
          {STEPS.map((label, i) => (
            <View key={label} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                i <= step ? styles.progressDotActive : null,
                i < step ? styles.progressDotComplete : null,
              ]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                ) : (
                  <Text style={[styles.progressDotText, i <= step && styles.progressDotTextActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>
                {label}
              </Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, i < step && styles.progressLineActive]} />
              )}
            </View>
          ))}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: bottomInset + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {step === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Event Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Winter Social Mixer"
                placeholderTextColor={Colors.light.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Club</Text>
              {userClubs.length === 0 ? (
                <Text style={styles.emptyChipText}>You are not a member of any clubs yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {userClubs.map(c => (
                    <Pressable
                      key={c.id}
                      onPress={() => { Haptics.selectionAsync(); setClubId(c.id); }}
                      style={[styles.chip, clubId === c.id && styles.chipSelected]}
                    >
                      <View style={[styles.chipDot, { backgroundColor: c.imageColor }]} />
                      <Text style={[styles.chipText, clubId === c.id && styles.chipTextSelected]}>
                        {c.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {categories.map(c => (
                  <Pressable
                    key={c.id}
                    onPress={() => { Haptics.selectionAsync(); setCategoryId(c.id); }}
                    style={[styles.chip, categoryId === c.id && styles.chipSelected]}
                  >
                    <MaterialIcons name={c.icon as any} size={16} color={categoryId === c.id ? "#FFF" : Colors.light.textSecondary} />
                    <Text style={[styles.chipText, categoryId === c.id && styles.chipTextSelected]}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Building / Location</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {buildings.map(b => (
                  <Pressable
                    key={b.id}
                    onPress={() => { Haptics.selectionAsync(); setBuildingId(b.id); }}
                    style={[styles.chip, buildingId === b.id && styles.chipSelected]}
                  >
                    <Ionicons name="location-outline" size={15} color={buildingId === b.id ? "#FFF" : Colors.light.textSecondary} />
                    <Text style={[styles.chipText, buildingId === b.id && styles.chipTextSelected]}>
                      {b.abbreviation}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Room Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 250"
                placeholderTextColor={Colors.light.textTertiary}
                value={room}
                onChangeText={setRoom}
              />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-02-15"
                placeholderTextColor={Colors.light.textTertiary}
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="14:00"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="16:00"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tell people what this event is about..."
                placeholderTextColor={Colors.light.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <MaterialIcons name="restaurant" size={20} color={Colors.light.warning} />
                  <Text style={styles.toggleLabel}>Free Food</Text>
                </View>
                <Switch
                  value={hasFood}
                  onValueChange={setHasFood}
                  trackColor={{ false: Colors.light.surfaceSecondary, true: Colors.light.accent }}
                  thumbColor={hasFood ? "#FFF" : "#F4F4F5"}
                />
              </View>
              {hasFood && (
                <TextInput
                  style={[styles.textInput, { marginTop: 12 }]}
                  placeholder="What food will be served?"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={foodDescription}
                  onChangeText={setFoodDescription}
                />
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Ionicons name="people-outline" size={20} color={Colors.light.accent} />
                  <Text style={styles.toggleLabel}>Limited Capacity</Text>
                </View>
                <Switch
                  value={hasLimitedCapacity}
                  onValueChange={setHasLimitedCapacity}
                  trackColor={{ false: Colors.light.surfaceSecondary, true: Colors.light.accent }}
                  thumbColor={hasLimitedCapacity ? "#FFF" : "#F4F4F5"}
                />
              </View>
              {hasLimitedCapacity && (
                <TextInput
                  style={[styles.textInput, { marginTop: 12 }]}
                  placeholder="Max number of attendees"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={maxCapacity}
                  onChangeText={setMaxCapacity}
                  keyboardType="numeric"
                />
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Tags</Text>
              <TextInput
                style={styles.textInput}
                placeholder="social, networking, fun (comma-separated)"
                placeholderTextColor={Colors.light.textTertiary}
                value={tags}
                onChangeText={setTags}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.card}>
              <Text style={styles.reviewHeading}>Event Summary</Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Title</Text>
                <Text style={styles.reviewValue}>{title}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Club</Text>
                <Text style={styles.reviewValue}>{getClubName(clubId)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>{getCategoryName(categoryId)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Location</Text>
                <Text style={styles.reviewValue}>{getBuildingName(buildingId)}, Room {room}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Date</Text>
                <Text style={styles.reviewValue}>{date}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Time</Text>
                <Text style={styles.reviewValue}>{startTime} - {endTime}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Description</Text>
                <Text style={styles.reviewValue}>{description}</Text>
              </View>

              {hasFood && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.reviewSection}>
                    <View style={styles.reviewLabelRow}>
                      <MaterialIcons name="restaurant" size={16} color={Colors.light.warning} />
                      <Text style={styles.reviewLabel}>Food</Text>
                    </View>
                    <Text style={styles.reviewValue}>{foodDescription || "Yes"}</Text>
                  </View>
                </>
              )}

              {hasLimitedCapacity && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Max Capacity</Text>
                    <Text style={styles.reviewValue}>{maxCapacity}</Text>
                  </View>
                </>
              )}

              {tags.trim() ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Tags</Text>
                    <View style={styles.tagRow}>
                      {tags.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 16 : Math.max(insets.bottom, 16) }]}>
          {step > 0 && (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={Colors.light.tint} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          {step < 2 ? (
            <Pressable onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>
          ) : (
            <Pressable onPress={handleCreate} style={[styles.nextButton, styles.createButton]} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.nextButtonText}>Create Event</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  topBarTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 0,
  },
  progressStep: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  progressDotActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  progressDotComplete: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  progressDotText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textTertiary,
  },
  progressDotTextActive: {
    color: "#FFF",
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textTertiary,
    marginLeft: 6,
  },
  progressLabelActive: {
    color: Colors.light.tint,
    fontFamily: "Inter_600SemiBold",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.light.success,
  },
  errorBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.error,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  chipScroll: {
    flexDirection: "row" as const,
  },
  chip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSelected: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: "#FFF",
  },
  emptyChipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  row: {
    flexDirection: "row" as const,
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  toggleInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  reviewHeading: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  reviewSection: {
    paddingVertical: 10,
  },
  reviewLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reviewLabelRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  tagRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.light.tintLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tint,
  },
  footer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  backButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  nextButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  createButton: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 24,
  },
});
