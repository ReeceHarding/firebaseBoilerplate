/*
<ai_context>
Contains server actions related to profiles in Firebase Firestore.
</ai_context>
*/

"use server"

import { db, collections } from "@/db/db"
import { FirebaseProfile } from "@/types/firebase-types"
import { ActionState } from "@/types"
import { FieldValue } from 'firebase-admin/firestore'

export async function createProfileAction(
  data: Omit<FirebaseProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionState<FirebaseProfile>> {
  console.log('[Profiles Action] Creating profile for user:', data.userId)
  
  try {
    const profileData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }
    
    const docRef = await db.collection(collections.profiles).add(profileData)
    console.log('[Profiles Action] Profile created with ID:', docRef.id)
    
    const newProfile = await docRef.get()
    const profileWithId = { id: docRef.id, ...newProfile.data() } as FirebaseProfile
    
    console.log('[Profiles Action] Profile created successfully')
    return {
      isSuccess: true,
      message: "Profile created successfully",
      data: profileWithId
    }
  } catch (error) {
    console.error("[Profiles Action] Error creating profile:", error)
    return { isSuccess: false, message: "Failed to create profile" }
  }
}

export async function getProfileByUserIdAction(
  userId: string
): Promise<ActionState<FirebaseProfile>> {
  console.log('[Profiles Action] Getting profile for user:', userId)
  
  try {
    const querySnapshot = await db
      .collection(collections.profiles)
      .where('userId', '==', userId)
      .limit(1)
      .get()
    
    if (querySnapshot.empty) {
      console.log('[Profiles Action] Profile not found for user:', userId)
      return { isSuccess: false, message: "Profile not found" }
    }
    
    const doc = querySnapshot.docs[0]
    const profile = { id: doc.id, ...doc.data() } as FirebaseProfile
    
    console.log('[Profiles Action] Profile retrieved successfully')
    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: profile
    }
  } catch (error) {
    console.error("[Profiles Action] Error getting profile by user id", error)
    return { isSuccess: false, message: "Failed to get profile" }
  }
}

export async function updateProfileAction(
  userId: string,
  data: Partial<Omit<FirebaseProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ActionState<FirebaseProfile>> {
  console.log('[Profiles Action] Updating profile for user:', userId)
  
  try {
    // First find the profile
    const querySnapshot = await db
      .collection(collections.profiles)
      .where('userId', '==', userId)
      .limit(1)
      .get()
    
    if (querySnapshot.empty) {
      console.log('[Profiles Action] Profile not found for update')
      return { isSuccess: false, message: "Profile not found to update" }
    }
    
    const doc = querySnapshot.docs[0]
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    }
    
    await doc.ref.update(updateData)
    console.log('[Profiles Action] Profile updated in Firestore')
    
    const updatedDoc = await doc.ref.get()
    const updatedProfile = { id: doc.id, ...updatedDoc.data() } as FirebaseProfile
    
    console.log('[Profiles Action] Profile updated successfully')
    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("[Profiles Action] Error updating profile:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

export async function updateProfileByStripeCustomerIdAction(
  stripeCustomerId: string,
  data: Partial<Omit<FirebaseProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ActionState<FirebaseProfile>> {
  console.log('[Profiles Action] Updating profile by Stripe customer ID:', stripeCustomerId)
  
  try {
    const querySnapshot = await db
      .collection(collections.profiles)
      .where('stripeCustomerId', '==', stripeCustomerId)
      .limit(1)
      .get()
    
    if (querySnapshot.empty) {
      console.log('[Profiles Action] Profile not found by Stripe customer ID')
      return {
        isSuccess: false,
        message: "Profile not found by Stripe customer ID"
      }
    }
    
    const doc = querySnapshot.docs[0]
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    }
    
    await doc.ref.update(updateData)
    console.log('[Profiles Action] Profile updated by Stripe customer ID')
    
    const updatedDoc = await doc.ref.get()
    const updatedProfile = { id: doc.id, ...updatedDoc.data() } as FirebaseProfile
    
    console.log('[Profiles Action] Profile updated successfully')
    return {
      isSuccess: true,
      message: "Profile updated by Stripe customer ID successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("[Profiles Action] Error updating profile by stripe customer ID:", error)
    return {
      isSuccess: false,
      message: "Failed to update profile by Stripe customer ID"
    }
  }
}

export async function deleteProfileAction(
  userId: string
): Promise<ActionState<void>> {
  console.log('[Profiles Action] Deleting profile for user:', userId)
  
  try {
    const querySnapshot = await db
      .collection(collections.profiles)
      .where('userId', '==', userId)
      .limit(1)
      .get()
    
    if (!querySnapshot.empty) {
      await querySnapshot.docs[0].ref.delete()
      console.log('[Profiles Action] Profile deleted successfully')
    } else {
      console.log('[Profiles Action] No profile found to delete')
    }
    
    return {
      isSuccess: true,
      message: "Profile deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("[Profiles Action] Error deleting profile:", error)
    return { isSuccess: false, message: "Failed to delete profile" }
  }
}
