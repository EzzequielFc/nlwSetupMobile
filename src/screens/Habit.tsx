import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { BackButton } from "../components/BackButton";

import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/CheckBox";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPorcentage } from "../utils/generate-progress-porcentage";
import { HabitsEmpty } from "../components/HabitsEmpyt";

interface Params {
  date: string;
}

interface DayInfoProps {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
  }[];
}

export function Habit() {
  const route = useRoute();
  const { date } = route.params as Params;

  const [isLoading, setIsloading] = useState(true);
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const parsedDate = dayjs(date);
  const isDateIsPast = parsedDate.endOf("day").isBefore(new Date());
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");

  const habitsProgress = dayInfo?.possibleHabits.length
    ? generateProgressPorcentage(
        dayInfo.possibleHabits.length,
        dayInfo.completedHabits.length
      )
    : 0;

  async function fetchHabits() {
    try {
      setIsloading(true);

      const response = await api.get("day", { params: { date } });
      setDayInfo(response.data);
      setCompletedHabits(response.data.completedHabits);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Ops",
        "Não foi possível carregar as informações dos hábitos"
      );
    } finally {
      setIsloading(false);
    }
  }

  async function handleToggleHabit(HabitId: string) {
    try {
      await api.patch(`/habits/${HabitId}/toggle`);
      if (completedHabits.includes(HabitId)) {
        setCompletedHabits((prevState) =>
          prevState.filter((habit) => habit !== HabitId)
        );
      } else {
        setCompletedHabits((prevState) => [...prevState, HabitId]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className="mt-6">
          {dayInfo?.possibleHabits ? (
            dayInfo?.possibleHabits.map((habit) => (
              <CheckBox
                key={habit.id}
                title={habit.title}
                checked={completedHabits.includes(habit.id)}
                onPress={() => handleToggleHabit(habit.id)}
                disabled={isDateIsPast}
              />
            ))
          ) : (
            <HabitsEmpty />
          )}
        </View>
        {isDateIsPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos passados
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
