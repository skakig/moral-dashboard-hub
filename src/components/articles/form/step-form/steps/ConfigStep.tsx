
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function ConfigStep({ form, setContentLength }) {
  const moralLevel = form.watch('moralLevel');
  const formattedMoralLevel = typeof moralLevel === 'string' ? parseInt(moralLevel, 10) : moralLevel;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Content Configuration</h3>
        <Alert variant="outline" className="bg-muted/50">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            These settings control the tone, length, and moral complexity of your content.
          </AlertDescription>
        </Alert>
      </div>
      
      <FormField
        control={form.control}
        name="tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tone</FormLabel>
            <RadioGroup 
              onValueChange={field.onChange} 
              defaultValue={field.value || "informative"} 
              className="grid grid-cols-3 gap-2"
            >
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="informative" id="informative" />
                </FormControl>
                <FormLabel htmlFor="informative" className="font-normal">
                  Informative
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="conversational" id="conversational" />
                </FormControl>
                <FormLabel htmlFor="conversational" className="font-normal">
                  Conversational
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="inspirational" id="inspirational" />
                </FormControl>
                <FormLabel htmlFor="inspirational" className="font-normal">
                  Inspirational
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="contentLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Length</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                setContentLength(value);
              }}
              defaultValue={field.value || "medium"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select content length" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="short">Short (300-500 words)</SelectItem>
                <SelectItem value="medium">Medium (500-800 words)</SelectItem>
                <SelectItem value="long">Long (800-1200 words)</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="moralLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moral Level</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={9}
                  step={1}
                  value={[formattedMoralLevel || 5]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>Basic</div>
                  <div>Complex</div>
                </div>
                <div className="text-center text-sm">
                  {formattedMoralLevel === 1 && 'Level 1: Survival Morality'}
                  {formattedMoralLevel === 2 && 'Level 2: Self-Interest'}
                  {formattedMoralLevel === 3 && 'Level 3: Social Contract'}
                  {formattedMoralLevel === 4 && 'Level 4: Fairness'}
                  {formattedMoralLevel === 5 && 'Level 5: Empathy'}
                  {formattedMoralLevel === 6 && 'Level 6: Altruism'}
                  {formattedMoralLevel === 7 && 'Level 7: Integrity'}
                  {formattedMoralLevel === 8 && 'Level 8: Virtue'}
                  {formattedMoralLevel === 9 && 'Level 9: Self-Actualization'}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Choose the moral complexity level (1-9) for your content.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
